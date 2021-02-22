export default (detections) => {
  const { landmarks } = detections;
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  const mouth = landmarks.getMouth();
  const leftEyeAttributes = {
    leftTop: leftEye[0],
    rightBottom: leftEye[3],
  };
  const rightEyeAttributes = {
    leftTop: rightEye[0],
    rightBottom: rightEye[3],
  };
  const noseAttributes = {
    top: nose[0],
    leftBottom: nose[4],
    rightBottom: nose[8],
    bottom: nose[6],
  };
  const mouthAttributes = {
    left: mouth[0],
    top: mouth[4],
    right: mouth[6],
    bottom: mouth[10],
  };
  return {
    leftEyeAttributes,
    rightEyeAttributes,
    mouthAttributes,
    noseAttributes,
  };
};
