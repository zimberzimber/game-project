import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { PlayerEntity } from "../Entities/Player";
import { HitboxBase } from "../Bases/HitboxBase";
import { ComponentBase } from "../Bases/ComponentBase";
import { TriggerState } from "../Models/TriggerState";
import CheckCollision from "./HitboxCollisionChecker";
import { IDOMDependant } from "../Bases/MiscInterfaces";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { TestEntity } from "../Entities/Test";
import { WebglDrawData } from "../Models/WebglDrawData";

export class Game implements IDOMDependant {
    canvas: any;
    interval: any;
    entities: EntityBase[];
    FPSInterval: number;
    playerEntity: EntityBase;
    paused: boolean = false;

    frameDelta: number = 0;
    oldFrameTime: number = new Date().getTime();

    fpsCounter: number = 0;
    oldTime: number = new Date().getTime();
    fpsDisplay: number = 0;

    OnDomLoaded(): void {
        this.canvas = document.getElementById("game-canvas");
        this.canvas.width = 600;
        this.canvas.height = 500;



        //@ts-ignore
        window.webglDef.init(window.shaderSources.vertex, window.shaderSources.fragment, this.canvas, document.getElementById('sprites'))



        this.entities = [];

        this.playerEntity = new PlayerEntity();
        this.AddEntity(this.playerEntity);


        for (let i = 0; i < 1; i++) {
            const p = new TestEntity();
            p.transform.position = [-300 * Math.random(), -250 * Math.random()];
            this.AddEntity(p);
        }

        const p2 = new PlayerEntity();
        p2.transform.position = [300 * Math.random(), 250 * Math.random()];
        this.AddEntity(p2);

        this.Start();
    }

    constructor() {
        this.entities = [];
    }

    Start(): void {
        requestAnimationFrame(this.Update.bind(this))
    }

    AddEntity(entity: EntityBase): void {
        this.entities.push(entity);
    }

    GetAllComponentsOfType(type: any) {
        let returned: ComponentBase[] = [];
        this.entities.forEach(e => returned = returned.concat(e.GetComponentsOfType(type)));
        return returned;
    }

    Update(): void {
        requestAnimationFrame(this.Update.bind(this));

        const newFrameTime = new Date().getTime();
        this.frameDelta = (newFrameTime - this.oldFrameTime) / 1000;
        this.oldFrameTime = newFrameTime;

        // Do nothing if game is paused
        if (this.paused) return;

        // Update all entities
        this.entities.forEach(e => e.Update());

        let triggers: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() != TriggerState.NotTrigger) as HitboxBase[];
        let colliders: HitboxBase[] = this.GetAllComponentsOfType(HitboxBase).filter(c => (c as HitboxBase).GetTriggerState() == TriggerState.NotTrigger) as HitboxBase[];

        triggers.forEach(t => colliders.forEach(c => {
            if (CheckCollision(t, c)) {
                t.OnCollision(c);
            }
        }));

        // Collect all drawing data:

        let triangleVertexes: number[] = [];
        let triangleIndexes: number[] = [];

        const dds = this.GetAllComponentsOfType(ImageDrawDirective);
        for (let i = 0; i < dds.length; i++) {
            triangleVertexes = triangleVertexes.concat((dds[i] as ImageDrawDirective).GetWebGlData());

            const s = i * 4;
            triangleIndexes = triangleIndexes.concat([
                s, s + 1, s + 2,
                s, s + 2, s + 3
            ]);
        }

        //@ts-ignore
        window.webglDef.setTriangleData(triangleVertexes, triangleIndexes);

        // Draw collisions if the option is enabled
        if (_G.DebugDraw) {
            // this.fpsCounter++;
            // const time = new Date().getTime();
            // this.context.fillText(this.fpsDisplay, 10, 10);
            // if (time - this.oldTime >= 250) {
            //     this.fpsDisplay = Math.floor(this.fpsCounter / (time - this.oldTime) * 1000);
            //     this.oldTime = time;
            //     this.fpsCounter = 0;
            // }

            let indexOffset = triangleIndexes[triangleIndexes.length - 1] + 1;
            const lineData: any[] = [];
            const hitboxes = this.GetAllComponentsOfType(HitboxBase) as HitboxBase[];

            for (let i = 0; i < hitboxes.length; i++) {
                const data: WebglDrawData | null = hitboxes[i].GetDebugDrawData()
                if (data) {
                    for (let j = 0; j < data.indexes.length; j++)
                        data.indexes[j] += indexOffset;

                    indexOffset += data.indexes.length - 2;
                    lineData.push({ v: data.vertexes, i: data.indexes });
                }
                indexOffset += 1;
            }

            //@ts-ignore
            window.webglDef.setLineData(lineData);
        }

        //@ts-ignore
        window.webglDef.draw();

        // Draw all drawables
        // const dd = new ToDrawLayerContainer();
        // this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.GetAllComponentsOfType(DrawDirectiveBase).forEach(c => {
        //     const layer = (c as DrawDirectiveBase).DrawLayer;
        //     dd[layer] = dd[layer].concat(c);
        // })
        // dd.DrawAll(this.context);

        // Draw collisions if the option is enabled
        // if (_G.DebugDraw) {
        //     this.fpsCounter++;
        //     this.GetAllComponentsOfType(HitboxBase).forEach(c => (c as HitboxBase).DrawHitbox(this.context))
        //     const time = new Date().getTime();

        //     if (time - this.oldTime >= 250) {
        //         this.fpsDisplay = Math.floor(this.fpsCounter / (time - this.oldTime) * 1000);
        //         this.oldTime = time;
        //         this.fpsCounter = 0;
        //     }

        //     this.context.fillText(this.fpsDisplay, 10, 10);
        // }
    }

    // Entities need a collision class
    // Draw directive and collision should have separate values
    // Different projectiles will have their own classes extending Entity
}
