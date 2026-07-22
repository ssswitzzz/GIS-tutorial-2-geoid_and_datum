import "./index.css";
import { Composition } from "remotion";
import { OpeningSceneElevation } from "./GISVisualization/OpeningSceneElevation";
import { EarthApproximationScene } from "./GISVisualization/EarthApproximationScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OpeningSceneElevation"
        component={OpeningSceneElevation}
        durationInFrames={873}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EarthApproximationScene"
        component={EarthApproximationScene}
        durationInFrames={1103}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
