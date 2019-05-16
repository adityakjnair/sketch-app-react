import React, { Component } from 'react'
import Filedrop from './Filedrop'

class FileList extends Component {
    state = {
        files: [
        ]
    }
    handleDrop = (files) => {
        let fileList = this.state.files
        for (var i = 0; i < files.length; i++) {
            if (!files[i].name) return
            fileList.push(files[i].name)
        }
        this.props.onFileDrop(files)
        this.setState({ files: fileList })
    }

    render() {
        return (
            <Filedrop handleDrop={this.handleDrop}>
                <div style={{ height: 300, width: 250 }}>
                    {this.state.files.map((file, i) =>
                        <div key={i}>{file}</div>
                    )}
                </div>
            </Filedrop>
        )
    }
}
export default FileList