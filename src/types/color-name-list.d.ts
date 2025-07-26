declare module "color-name-list" {
    export interface Color {
        name: string;
        hex: string;
    }
    export const colornames: Color[];
}