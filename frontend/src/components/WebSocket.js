import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WS_BASE_URL } from '../config'
import { authenticateSymbl } from '../api/symbl';
import { v4 as uuid } from 'uuid';

const processFactCheck = async (transcript) => {
    try {
        const response = await fetch('http://localhost:8000/generate-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_message: transcript }),
        });

        if (!response.ok) {
            throw new Error(`http response error: status - ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in processFactCheck:", error);
        return null;
    }
};

async function initAudioStream(websocket) {
    const micInputStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    const streamAudio = (stream) => {
        const AudioContext = window.AudioContext;
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(1024, 1, 1);
        const gainNode = context.createGain();
        source.connect(gainNode);
        gainNode.connect(processor);
        processor.connect(context.destination);
        processor.onaudioprocess = (e) => {
            // convert to 16-bit payload
            const inputData = e.inputBuffer.getChannelData(0) || new Float32Array(this.bufferSize);
            const targetBuffer = new Int16Array(inputData.length);
            for (let index = inputData.length; index > 0; index--) {
                targetBuffer[index] = 32767 * Math.min(1, inputData[index]);
            }

            // send audio stream to websocket
            websocket.send(targetBuffer.buffer);
        };
    };

    streamAudio(micInputStream)
}

const WebSocket = ({ socketUrl }) => {
    const [liveCaption, setLiveCaption] = useState('')
    const [transcription, setTranscription] = useState([]);
    const [factChecks, setFactChecks] = useState([]);

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, {
        onOpen: () => {
            sendJsonMessage({
                type: 'start_request',
                insightTypes: ['action_item'],
                trackers: [
                    {
                        name: 'COVID',
                        vocabulary: [
                            "Vaccine",
                            "Doctor Fauci",
                            "Methyline blue",
                            "Population control",
                        ],
                    },
                ],
                config: {
                    // confidenceThreshold: 0.5,
                    speechRecognition: {
                        // encoding: 'LINEAR16',
                        sampleRateHertz: 44100,
                    },
                    sentiment: true,
                    trackers: {
                        interimResults: true,
                        enableAllTrackers: true
                    }
                },
            });
        },
        onClose: () => console.log('closed'),
        onError: (error) => console.log('error', error),
        onMessage: (message) => {
            const msg = JSON.parse(message.data);
            if (msg.message && msg.message.type && msg.message.type === 'recognition_started') {
                console.log('[recognition_started] Initiating audio stream...')
                initAudioStream(getWebSocket());
            }
        }
    });

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            if (data && data.message && data.message.type === 'recognition_result') {
                const transcribedText = data.message.payload.raw.alternatives[0].transcript
                console.log('this is transcribed text', transcribedText)
                setLiveCaption(transcribedText);
            }

            if (data && data.type === 'message_response') {
                console.log('i am hit', data)
                console.log('message_response', data.messages[0].payload.content);

                let text = '';
                data.messages.forEach(message => {
                    text = text.concat(message.payload.content)
                })
                console.log('this is text', text)
                setTranscription(prev => prev.concat(text))
                const res = processFactCheck(text);
                console.log('this is res', res)
                res.then(result => {
                    console.log('result', result)
                    setFactChecks(prev => prev.concat(result))
                })
            }

            // console.log('data is coming in', data)
            // setTranscription((prev) => prev.concat(data));
        }
    }, [lastMessage, setTranscription]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div>
            <span>The WebSocket is currently {connectionStatus}</span>
            <h2>Live Caption</h2>
            <ul>{liveCaption}</ul>

            <h2>Transcript</h2>
            <ul>
                {transcription.map((message, idx) => (
                    <span key={idx}>{message}</span>
                ))}
            </ul>

            <h2>Fact Checks</h2>
            <ul>
                {factChecks.map((factCheck, idx) => (
                    <div key={idx} style={{ borderRadius: '20px', border: '1px solid black', padding: '24px', margin: '32px' }}>
                        <div>User Input: <i>"{factCheck && factCheck.user_input}"</i></div>
                        <br />
                        <div>OpenAI Output: <b>{factCheck && factCheck.openai_response}</b></div>
                    </div>
                ))}
            </ul>
        </div>
    );
};

const WebSocketWrapper = () => {
    const [socketUrl, setSocketUrl] = useState('');

    useEffect(() => {
        async function getSocketUrl() {
            const token = await authenticateSymbl();
            console.log('Check Symbl token is set in local cache', window.localStorage.getItem('symblToken'))
            setSocketUrl(`${WS_BASE_URL}/v1/realtime/insights/${uuid()}?access_token=${token}`)
        }
        getSocketUrl();
    }, [])

    if (!socketUrl) {
        return <div>Authenticating...</div>
    }

    return <WebSocket socketUrl={socketUrl} />
}

export default WebSocketWrapper