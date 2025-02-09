export interface IStyleClasses {
    container: string;
    screen: string;
    particle: string;
}
export interface IParticle {
    color: string;
    degree: number;
}
interface IParticlesProps {
    particles: IParticle[];
    duration: number;
    particleSize: number;
    force: number;
    height: number | string;
    width: number;
}
declare const useStyles: ({ particles, duration, height, width, force, particleSize }: IParticlesProps) => (data?: {
    theme?: Jss.Theme | undefined;
} | undefined) => import("jss").Classes<"container" | "screen" | "particle" | "@keyframes y-axis">;
export default useStyles;
