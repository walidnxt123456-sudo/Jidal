import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export default async function handler(req, res) {
  const { audios, subtitles, background } = req.body;

  // Build a video timeline using ffmpeg
  const mp4Buffer = await buildVideo(audios, subtitles, background); // pseudocode

  res.setHeader("Content-Type", "video/mp4");
  res.send(mp4Buffer);
}