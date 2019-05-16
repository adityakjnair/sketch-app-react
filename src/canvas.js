import React, { Component } from 'react';
import { v4 } from 'uuid';
import Pusher from 'pusher-js';
import FileList from './FileList'

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.endPaintEvent = this.endPaintEvent.bind(this);
        this.onFileDrop = this.onFileDrop.bind(this);
        Pusher.logToConsole = true;
        this.pusher = new Pusher('8bfa62afc4715b6ebbf3', {
            cluster: 'us3',
            forceTLS: true
        });
    }

    isPainting = false;
    // Different stroke styles to be used for user and guest
    userStrokeStyle = '#EE92C2';
    guestStrokeStyle = '#F0C987';
    line = [];
    // v4 creates a unique id for each user. We used this since there's no auth to tell users apart
    userId = v4();
    prevPos = { offsetX: 0, offsetY: 0 };

    onMouseDown({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        this.isPainting = true;
        this.prevPos = { offsetX, offsetY };
    }

    onMouseMove({ nativeEvent }) {
        if (this.isPainting) {
            const { offsetX, offsetY } = nativeEvent;
            const offSetData = { offsetX, offsetY };
            // Set the start and stop position of the paint event.
            const positionData = {
                start: { ...this.prevPos },
                stop: { ...offSetData },
            };
            // Add the position to the line array
            this.line = this.line.concat(positionData);
            this.paint(this.prevPos, offSetData, this.userStrokeStyle);
        }
    }
    endPaintEvent() {
        if (this.isPainting) {
            this.isPainting = false;
            this.sendPaintData(0);
        }
    }
    paint(prevPos, currPos, strokeStyle) {
        const { offsetX, offsetY } = currPos;
        const { offsetX: x, offsetY: y } = prevPos;

        this.ctx.beginPath();
        this.ctx.strokeStyle = strokeStyle;
        // Move the the prevPosition of the mouse
        this.ctx.moveTo(x, y);
        // Draw a line to the current position of the mouse
        this.ctx.lineTo(offsetX, offsetY);
        // Visualize the line using the strokeStyle
        this.ctx.stroke();
        this.prevPos = { offsetX, offsetY };
    }

    async sendPaintData(origin) {
        var body = {};
        if (origin === 0) {
            body = {
                line: this.line,
                userId: this.userId,
                origin: origin
            }
        } else {
            body = {
                userId: this.userId,
                origin: origin
            }

        }

        // We use the native fetch API to make requests to the server
        const req = await fetch('http://localhost:4000/paint', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });
        // eslint-disable-next-line no-unused-vars
        const res = await req.json();
        this.line = [];
    }

    onFileDrop(files) {
        const reader = new FileReader()
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onloadend = () => {
            // Do whatever you want with the file contents
            const binaryStr = reader.result
            console.log(binaryStr)
            this.ctx.font = '20px Comic Sans MS';
            this.ctx.fillStyle = 'white';
            binaryStr.split('\n').map((text, i) => this.ctx.fillText(text, this.canvas.width / 2, (this.canvas.height / 2) + (i + 1) * 30));
            this.sendPaintData(binaryStr.split('\n'));
        }
        Array.from(files).forEach(file => reader.readAsText(file))
    }

    componentDidMount() {
        // Here we set up the properties of the canvas element. 
        this.canvas.width = 1000;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = 5;
        const channel = this.pusher.subscribe('painting');
        channel.bind('draw', (data) => {
            if(data.origin.length){
                if (data.userId !== this.userId) {
                    this.ctx.font = '20px Comic Sans MS';
                    this.ctx.fillStyle = 'red';
                    data.origin.map((text, i) => this.ctx.fillText(text, this.canvas.width / 2, (this.canvas.height / 2) + (i + 1) * 30));
                }
            }else {
            const { userId, line } = data;
            if (userId !== this.userId) {
                line.forEach((position) => {
                    this.paint(position.start, position.stop, this.guestStrokeStyle);
                });
            }
        }
        });
    }

    render() {
        return (
            <div>
                <canvas
                    // We use the ref attribute to get direct access to the canvas element. 
                    ref={(ref) => (this.canvas = ref)}
                    style={{ background: 'black' }}
                    onMouseDown={this.onMouseDown}
                    onMouseLeave={this.endPaintEvent}
                    onMouseUp={this.endPaintEvent}
                    onMouseMove={this.onMouseMove}
                />
                <FileList onFileDrop={this.onFileDrop} />
            </div>
        );
    }
}
export default Canvas;