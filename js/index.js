// import AudioRecorder from "./audiorecorder.js";

const recordBtn = document.getElementById("recordBtn");
const audioElement = document.getElementById("audioElement");
let audioElementSource;

setButtonText("Record");

recordBtn.addEventListener("click", () => {
  recordBtn.disabled = true;
  startAudioRecording();

  setTimeout(stopAudioRecording, 5000);
});

function startAudioRecording() {
  console.log("Recording Audio...");
  setButtonText("Recording...");

  //start recording using the audio recording API
  audioRecorder
    .start()
    .then(() => {
      //on success
      //store the recording start time to display the elapsed time according to it
      //  audioRecordStartTime = new Date();
    })
    .catch((error) => {
      //on error
      //No Browser Support Error
      if (
        error.message.includes(
          "mediaDevices API or getUserMedia method is not supported in this browser."
        )
      ) {
        console.log("To record audio, use browsers like Chrome and Firefox.");
        displayBrowserNotSupportedOverlay();
      }

      //Error handling structure
      switch (error.name) {
        case "AbortError": //error from navigator.mediaDevices.getUserMedia
          console.log("An AbortError has occured.");
          break;
        case "NotAllowedError": //error from navigator.mediaDevices.getUserMedia
          console.log(
            "A NotAllowedError has occured. User might have denied permission."
          );
          break;
        case "NotFoundError": //error from navigator.mediaDevices.getUserMedia
          console.log("A NotFoundError has occured.");
          break;
        case "NotReadableError": //error from navigator.mediaDevices.getUserMedia
          console.log("A NotReadableError has occured.");
          break;
        case "SecurityError": //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
          console.log("A SecurityError has occured.");
          break;
        case "TypeError": //error from navigator.mediaDevices.getUserMedia
          console.log("A TypeError has occured.");
          break;
        case "InvalidStateError": //error from the MediaRecorder.start
          console.log("An InvalidStateError has occured.");
          break;
        case "UnknownError": //error from the MediaRecorder.start
          console.log("An UnknownError has occured.");
          break;
        default:
          console.log("An error occured with the error name " + error.name);
      }
    });
}

function stopAudioRecording() {
  console.log("Stopping Audio Recording...");

  //stop the recording using the audio recording API
  audioRecorder
    .stop()
    .then((audioAsblob) => {
      //Play recorder audio
      playAudio(audioAsblob, true);
    })
    .catch((error) => {
      //Error handling structure
      switch (error.name) {
        case "InvalidStateError": //error from the MediaRecorder.stop
          console.log("An InvalidStateError has occured.");
          break;
        default:
          console.log("An error occured with the error name " + error.name);
      }
    });

  // try {
  //   const audioBlob = await audioRecorder.stop();
  //   playAudio(audioBlob, true);
  // } catch (error) {
  //   //Error handling structure
  //   switch (error.name) {
  //     case "InvalidStateError": //error from the MediaRecorder.stop
  //       console.log("An InvalidStateError has occured.");
  //       break;
  //     default:
  //       console.log("An error occured with the error name " + error.name);
  //   }
  // }
}

function playAudio(audioBlob, useSource) {
  setButtonText("Playing...");
  if (useSource) {
    //read content of files (Blobs) asynchronously
    let reader = new FileReader();

    //once content has been read
    reader.onload = (e) => {
      //store the base64 URL that represents the URL of the recording audio
      let base64URL = e.target.result;

      //If this is the first audio playing, create a source element
      //as pre populating the HTML with a source of empty src causes error
      if (!audioElementSource)
        //if its not defined create it (happens first time only)
        createSourceForAudioElement();

      //set the audio element's source using the base64 URL
      audioElementSource.src = base64URL;

      //set the type of the audio element based on the recorded audio's Blob type
      let BlobType = audioBlob.type.includes(";")
        ? audioBlob.type.substring(0, audioBlob.type.indexOf(";"))
        : audioBlob.type;
      audioElementSource.type = BlobType;

      //call the load method as it is used to update the audio element after changing the source or other settings
      audioElement.load();

      //play the audio after successfully setting new src and type that corresponds to the recorded audio
      console.log("Playing audio...");
      audioElement.play();

      audioElement.addEventListener("ended", () => {
        console.log("Audio ended");
        recordBtn.disabled = false;
        setButtonText("Record");
      });
    };
    //read content and convert it to a URL (base64)
    reader.readAsDataURL(audioBlob);
  } else {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    audio.addEventListener("ended", () => {
      console.log("Audio ended");
      recordBtn.disabled = false;
      setButtonText("Record");
    });
  }
}

/** Creates a source element for the the audio element in the HTML document*/
function createSourceForAudioElement() {
  let sourceElement = document.createElement("source");
  audioElement.appendChild(sourceElement);

  audioElementSource = sourceElement;
}

function setButtonText(text) {
  recordBtn.innerHTML = text;
}
