import "./index.css";
import { Composition } from "remotion";
import { OpeningSceneElevation } from "./GISVisualization/OpeningSceneElevation";
import { EarthApproximationScene } from "./GISVisualization/EarthApproximationScene";
import { GeodeticCoordinateScene } from "./GISVisualization/GeodeticCoordinateScene";
import { GeodeticElementsScene } from "./GISVisualization/GeodeticElementsScene";
import { GeodeticHeightScene } from "./GISVisualization/GeodeticHeightScene";

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
      <Composition
        id="GeodeticCoordinateScene"
        component={GeodeticCoordinateScene}
        durationInFrames={1360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GeodeticElementsScene"
        component={GeodeticElementsScene}
        durationInFrames={2660}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GeodeticHeightScene"
        component={GeodeticHeightScene}
        durationInFrames={2742}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
