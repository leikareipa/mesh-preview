/*
 * 2020 Tarpeeksi Hyvae Soft
 * 
 * Software: Mesh preview
 *
 */

import Vue from "./vue.esm.browser.min.js";
import Vuex from "./vuex.esm.browser.min.js";

import InfoBox from "./vue-components/InfoBox.js";
import Rendering from "./vue-components/Rendering.js";
import ControlPanel from "./vue-components/ControlPanel.js";

import {Luu} from "./luujanko.js";

export function start_mesh_preview(args = {})
{
    args = {
        ...{// Default arguments.
            infoText: "",
            modulePath: "./",
            get_mesh_data: async (meshMetadata)=>([]),
            meshesMetadata: [],
            containerId: "mesh-preview",
            defaultOrientation: [0.5, 0, 0],
            rotationDelta: [0, 0.0006, 0],
            defaultViewDistance: 40000,
            continuousRendering: true,
        },
        ...args,
    };

    // Create the app's container DOM element.
    const containerElement = document.createElement("div");
    containerElement.setAttribute("id", args.containerId);
    document.body.appendChild(containerElement);

    Vue.use(Vuex);

    const meshPreviewStore = new Vuex.Store({
        state: {
            startupArgs: args,
            knownMeshes: args.meshesMetadata,
            activeMeshIdx: -1,
            activeMeshNgons: [],
            viewDistance: args.defaultViewDistance,
        },
        mutations: {
            async set_mesh_idx(state, activeMeshIdx)
            {
                state.activeMeshIdx = activeMeshIdx;
                state.activeMeshNgons = [];
                        
                try
                {
                    const meshMetadata = state.knownMeshes[state.activeMeshIdx];
                    const meshData = await args.get_mesh_data(meshMetadata);
                    const luujankoMesh = meshData.map(face=>Luu.ngon(face.map(v=>Luu.vertex(v.x, v.y, v.z))));

                    state.activeMeshNgons = luujankoMesh;
                    state.viewDistance = (meshMetadata.viewDistance || state.startupArgs.defaultViewDistance || 40000);
                }
                catch (error)
                {
                    window.alert(error);
                    console.error(error);
                }
            },
            set_render_distance(state, distance)
            {
                state.viewDistance = distance;
            },
        }
    });

    const app = new Vue({
        el: `#${args.containerId}`,
        store: meshPreviewStore,
        data: {
            frameCount: 0,
            frameTimeDeltaMs: 0,
            rotationVector: Luu.rotation(...args.defaultOrientation),
        },
        components: {
            "mesh-preview-info-box": InfoBox,
            "mesh-preview-control-panel": ControlPanel,
            "mesh-preview-rendering": Rendering,
        },
        computed: {
            viewDistance: {
                get: function()
                {
                    return this.$store.state.viewDistance;
                },
            },
            meshNgons: {
                get: function()
                {
                    return this.$store.state.activeMeshNgons;
                },
            },
        },
        watch: {
            frameCount: function()
            {
                this.render_frame();
            },
            viewDistance: function()
            {
                this.frameCount++;
            },
            meshNgons: function()
            {
                this.frameCount++;
            },
        },
        methods: {
            render_frame: function()
            {
                const svgImage = document.getElementById("luujanko-rendering");

                // Have the SVG fill the entire viewport.
                svgImage.setAttribute("width", document.documentElement.clientWidth);
                svgImage.setAttribute("height", document.documentElement.clientHeight);

                if (args.continuousRendering)
                {
                    this.rotationVector.x += (args.rotationDelta[0] * this.frameTimeDeltaMs);
                    this.rotationVector.y += (args.rotationDelta[1] * this.frameTimeDeltaMs);
                    this.rotationVector.z += (args.rotationDelta[2] * this.frameTimeDeltaMs);
                }

                const ngons = (this.$store.state.activeMeshNgons || []);
                const viewDistance = (this.$store.state.viewDistance || args.defaultViewDistance);

                const scene = Luu.mesh(ngons, {
                    rotation: this.rotationVector,
                });

                const options = {
                    fov: 70,
                    nearPlane: 0.1,
                    farPlane: 10000000,
                    viewRotation: Luu.rotation(0, 0, 0),
                    viewPosition: Luu.translation(0, 0, -viewDistance),
                };

                Luu.render([scene], svgImage, options);
            },
        },
        mounted()
        {
            const self = this;

            this.$store.commit("set_mesh_idx", 0);

            (function screen_refresh_loop(timestamp = 0, frameTimeDeltaMs = 0, frameCount = 0)
            {
                if (args.continuousRendering)
                {
                    self.frameCount++;
                    self.frameTimeDeltaMs = frameTimeDeltaMs;
                }

                window.requestAnimationFrame((newTimestamp)=>
                {
                    screen_refresh_loop(newTimestamp,
                                        (newTimestamp - timestamp),
                                        (frameCount + 1));
                });
            })();
        },
        template: `
        <div>

            <link rel="stylesheet"
                  type="text/css"
                  href="${args.modulePath}/mesh-preview.css">

            <mesh-preview-rendering></mesh-preview-rendering>

            <mesh-preview-control-panel></mesh-preview-control-panel>

            <mesh-preview-info-box></mesh-preview-info-box>
            
        </div>
        `,
    });

    return;
}
