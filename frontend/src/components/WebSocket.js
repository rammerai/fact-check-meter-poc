import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WS_BASE_URL } from '../config'
import { authenticateSymbl } from '../api/symbl';
import { v4 as uuid } from 'uuid';

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
    const [messageHistory, setMessageHistory] = useState([]);

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
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
    }, [lastMessage, setMessageHistory]);


    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div>
            <button
                onClick={initAudioStream}
                disabled={readyState !== ReadyState.OPEN}
            >
                Click Me to send 'Hello'
            </button>
            <span>The WebSocket is currently {connectionStatus}</span>
            {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
            <ul>
                {messageHistory.map((message, idx) => (
                    <span key={idx}>{message ? message.data : null}</span>
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