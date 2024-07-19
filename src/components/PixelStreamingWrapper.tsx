// Copyright Epic Games, Inc. All Rights Reserved.

import React, { ChangeEvent, useEffect, useRef, useState, useCallback } from 'react';
import {
    Config,
    AllSettings,
    PixelStreaming
} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';

export interface PixelStreamingWrapperProps {
    initialSettings?: Partial<AllSettings>;
}

export const PixelStreamingWrapper = ({
    initialSettings
}: PixelStreamingWrapperProps) => {



    // A reference to parent div element that the Pixel Streaming library attaches into:
    const videoParent = useRef<HTMLDivElement>(null);

    const textBox = useRef(null)

    // Pixel streaming library instance is stored into this state variable after initialization:
    const [pixelStreaming, setPixelStreaming] = useState<PixelStreaming>();
    
    // A boolean state variable that determines if the Click to play overlay is shown:
    const [clickToPlayVisible, setClickToPlayVisible] = useState(false);

    // Run on component mount:
    useEffect(() => {
        if (videoParent.current) {
            // Attach Pixel Streaming library to videoParent element:
            const config = new Config({ initialSettings });
            const streaming = new PixelStreaming(config, {
                videoElementParent: videoParent.current
            });
            
            // register a playStreamRejected handler to show Click to play overlay if needed:
            streaming.addEventListener('playStreamRejected', () => {
                setClickToPlayVisible(true);
            });
            

            // Save the library instance into component state so that it can be accessed later:
            setPixelStreaming(streaming);
            //STT
            const STT = window.SpeechRecognition || window.webkitSpeechRecognition
            const SpeechRecognition = new STT();
            const s2t_btn = document.getElementById("p2t_btn")
            
            const texttbox_input = document.getElementById("textbox_input")

            s2t_btn.onmousedown = () => {
                console.log('MouseDown')
                SpeechRecognition.start();
            }       

            s2t_btn.onmouseup = () => {
                console.log('MouseUP')
                setTimeout(()=>{
                    SpeechRecognition.stop();
                },500)
            }

            texttbox_input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    console.log(textBox.current.value)
                    streaming.emitUIInteraction({type:'transcript', data:textBox.current.value});
                    textBox.current.value = '';
                }
            }

            SpeechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log(transcript);
                streaming.emitUIInteraction({type:'transcript', data:transcript});
            }
            // Clean up on component unmount:
            return () => {
                try {
                    streaming.disconnect();
                } catch {}
            };
        }
    }, []);

    return (
        
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}
        >
            <div style={{
            height: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            zIndex: '1',
            marginTop: '90vh'
        }}
        >
        <input type='text' id='textbox_input' style={{
                    height: '5%',
                    width: '35%',
                    fontSize: 'xx-large',
                    marginRight: '2%'  
        }} 
        placeholder='Enter question'
        ref = {textBox}
        ></input>
        <button id='p2t_btn' style={{height: '5%', fontSize: 'xx-large'}} type='button'
            >Press to Talk</button>
        </div>
            <div
                style={{
                    width: '100%',
                    height: '100%'
                }}
                ref={videoParent}
            />
            
            {clickToPlayVisible && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        pixelStreaming?.play();
                        setClickToPlayVisible(false);
                    }}
                >
                    <div>Click to play</div>
                </div>
            )}

        </div>
    );
};
