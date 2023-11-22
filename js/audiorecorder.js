//API to handle audio recording
export default class AudioRecorder extends EventTarget {
  constructor() {
    super();
    /** Stores the recorded audio as Blob objects of audio data as the recording continues
     * @type {Blob[]}
     */
    this.audioBlobs = [];
    /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts
     * @type {MediaRecorder}
     */
    this.mediaRecorder = null;
    /** Stores the reference to the stream currently capturing the audio
     *  @type {MediaStream}
     */
    this.streamBeingCaptured = null;
  }

  /** Start recording the audio
   * @param {string} audioSource device id of the audio source
   * @returns {Promise} - returns a promise that resolves if audio recording successfully started
   */
  async start(audioSource) {
    //Feature Detection
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature is not supported in browser
      //return a custom error
      return Promise.reject(
        new Error(
          "mediaDevices API or getUserMedia method is not supported in this browser."
        )
      );
    } else {
      //Feature is supported in browser

      /**
       * @type {MediaStreamConstraints}
       */
      let constraints;
      // create audio constraints
      if (audioSource) {
        constraints = {
          audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        };
      } else {
        constraints = {
          audio: true,
        };
      }

      //create an audio stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this._startRecording(stream);
    }
  }

  /** Start recording the audio
   * @param {MediaStream} mediaStream the MediaStream to be used for recording
   * @returns {Promise} - returns a promise that resolves if audio recording successfully started
   */
  async startWithMediaStream(mediaStream) {
    //Feature Detection
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature is not supported in browser
      //return a custom error
      return Promise.reject(
        new Error(
          "mediaDevices API or getUserMedia method is not supported in this browser."
        )
      );
    } else {
      if (!mediaStream) {
        this.start();
      } else {
        this._startRecording(mediaStream);
      }
    }
  }

  _startRecording(mediaStream) {
    //Feature is supported in browser
    this.streamBeingCaptured = mediaStream;
    //create a media recorder instance by passing that stream into the MediaRecorder constructor
    this.mediaRecorder = new MediaRecorder(mediaStream);
    //clear previously saved audio Blobs, if any
    this.audioBlobs = [];
    //add a dataavailable event listener in order to store the audio data Blobs when recording
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      //store audio Blob object
      this.audioBlobs.push(event.data);
    });
    //start the recording by calling the start method on the media recorder
    this.mediaRecorder.start();
  }

  /** Stop the started audio recording
   * @returns {Promise} - returns a promise that resolves to the audio as a blob file
   */
  stop() {
    //return a promise that would return the blob or URL of the recording
    return new Promise((resolve) => {
      //save audio type to pass to set the Blob type
      let mimeType = this.mediaRecorder.mimeType;

      //listen to the stop event in order to create & return a single Blob object
      this.mediaRecorder.addEventListener("stop", () => {
        //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
        let audioBlob = new Blob(this.audioBlobs, { type: mimeType });

        //resolve promise with the single audio blob representing the recorded audio
        resolve(audioBlob);
      });
      this.cancel();
    });
  }

  /** Cancel audio recording*/
  cancel() {
    //stop the recording feature
    this.mediaRecorder.stop();
    //stop all the tracks on the active stream in order to stop the stream
    this._stopStream();
    //reset properties for next recording
    this.mediaRecorder = null;
    this.streamBeingCaptured = null;
  }

  /** Stop all the tracks on the active stream in order to stop the stream and remove
   * the red flashing dot showing in the tab
   */
  _stopStream() {
    //stopping the capturing request by stopping all the tracks on the active stream
    const tracks = this.streamBeingCaptured.getTracks();
    tracks.forEach((track) => {
      track.stop(); // stop each one
    });
  }
}
