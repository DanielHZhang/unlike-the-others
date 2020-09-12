import React, {Component, createRef, RefObject} from 'react';
import Peer, {peerjs} from 'peerjs';
import {socket} from 'src/client/networking/socketio';

type AudioStream = {
  reactRef: RefObject<HTMLAudioElement>;
  stream: MediaStream;
};

type Props = {};
type State = {
  audioStreams: Map<string, AudioStream>;
};

export class AudioCall extends Component<Props, State> {
  private peer: Peer;
  private localStream?: MediaStream;

  constructor(props: Props) {
    super(props);
    this.state = {audioStreams: new Map<string, AudioStream>()};
    this.peer = new Peer();
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return (
      <>
        {Array.from(this.state.audioStreams).map(([id, audio]) => (
          <audio key={id} autoPlay={true} ref={audio.reactRef} />
        ))}
      </>
    );
  }

  async init() {
    if (!peerjs.util.supports.audioVideo) {
      this.unsupported();
    }
    await this.getLocalAudioStream();
    this.peer.on('call', this.handleIncomingCall);
    this.peer.on('open', this.handlePeerOpen);
    this.peer.on('error', (err) => alert(err));
  }

  async getLocalAudioStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
    } catch (err) {
      alert(err);
    }
  }

  handleIncomingCall = (call: Peer.MediaConnection) => {
    call.answer(this.localStream);
    call.on('stream', (stream) => this.addStream(call.peer, stream));
  };

  removeStream(peerId: string) {
    this.state.audioStreams.delete(peerId);
    this.setState({audioStreams: new Map(this.state.audioStreams)});
  }

  addStream(peerId: string, stream: MediaStream) {
    const newAudioStream: AudioStream = {
      reactRef: createRef(),
      stream,
    };
    this.state.audioStreams.set(peerId, newAudioStream);
    this.setState({audioStreams: new Map(this.state.audioStreams)}, () => {
      // Access the srcObject property via ref of the audio element
      const audioElement = newAudioStream.reactRef.current;
      if (audioElement) {
        if ('srcObject' in audioElement) {
          audioElement.srcObject = newAudioStream.stream;
        } else {
          // Compat: only for older browsers that do not support srcObject
          audioElement!.src = window.URL.createObjectURL(newAudioStream.stream);
        }
      }
    });
  }

  handlePeerOpen = (id: string) => {
    socket.on('registerAudioIdSuccess', (audioIds: string[]) => {
      audioIds.forEach((id) => this.callPeer(id));
    });
    socket.emit('registerAudioId', id);
  };

  callPeer(peerId: string) {
    const call = this.peer.call(peerId, this.localStream!);
    call.on('error', (err) => alert(err));
    call.on('stream', (stream) => this.addStream(peerId, stream));
  }

  unsupported() {
    alert("Your browser doesn't support audio calls.");
  }
}
