export default (detections) => {
  const { landmarks } = detections;
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  const mouth = landmarks.getMouth();
  const leftEyeAttributes = {
    x: leftEye[0].x,
    y: Math.min(leftEye[1].y, leftEye[2].y),
    x_max: leftEye[3].x,
    y_max: Math.max(leftEye[4].y, leftEye[5].y),
  };
  const rightEyeAttributes = {
    x: rightEye[0].x,
    y: Math.min(rightEye[1].y, rightEye[2].y),
    x_max: rightEye[3].x,
    y_max: Math.max(rightEye[4].y, rightEye[5].y),
  };
  const noseAttributes = {
    x: Math.min(nose[4].x, nose[3].x),
    y: nose[0].y,
    x_max: nose[8].x,
    y_max: Math.max(nose[4].y, nose[5].y),
  };
  const mouthAttributes = {
    x: mouth[0].x,
    y: mouth[4].y,
    x_max: mouth[6].x,
    y_max: mouth[11].y,
  };
  return {
    leftEyeAttributes,
    rightEyeAttributes,
    mouthAttributes,
    noseAttributes,
  };
};
