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
    // Create the app's DOM tree.
    {
        const containerElement = document.createElement("div");

        containerElement.setAttribute("id", (args.containerId || "mesh-preview"));
        containerElement.appendChild(document.createElement("mesh-preview-rendering"));
        containerElement.appendChild(document.createElement("mesh-preview-control-panel"));
        containerElement.appendChild(document.createElement("mesh-preview-info-box"));

        document.body.appendChild(containerElement);
    }

    Vue.use(Vuex);

    const meshPreviewStore = new Vuex.Store({
        state: {
            startupArgs: args,
            knownMeshes: args.meshesMetadata,
            activeMeshIdx: 0,
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
                    const meshData = await args.get_mesh(meshMetadata);
                    const luujankoMesh = meshData.map(face=>Luu.ngon(face.vertices.map(v=>Luu.vertex(v.x, v.y, v.z))));

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

    const meshPreview = new Vue({
        el: `#${args.containerId}`,
        store: meshPreviewStore,
        data: {
        },
        components: {
            "mesh-preview-info-box": InfoBox,
            "mesh-preview-control-panel": ControlPanel,
            "mesh-preview-rendering": Rendering,
        },
        created()
        {
            const uiStore = this.$store;
            const rotationVector = Luu.rotation(0.5, 0, 0);

            uiStore.commit("set_mesh_idx", 0);

            // Start the renderer. It'll keep running and rendering whatever polygons the
            // UI gives it.
            (function render_loop(timestamp = 0, frameTimeDeltaMs = 0, frameCount = 0)
            {
                const svgImage = document.getElementById("luujanko-rendering");

                if (svgImage)
                {
                    // Have the SVG fill the entire viewport.
                    svgImage.setAttribute("width", document.documentElement.clientWidth);
                    svgImage.setAttribute("height", document.documentElement.clientHeight);

                    // Automatically rotate the model.
                    rotationVector.y += (0.0006 * frameTimeDeltaMs);

                    const ngons = (uiStore.state.activeMeshNgons || []);
                    const viewDistance = (uiStore.state.viewDistance || uiStore.state.startupArgs.defaultViewDistance);

                    const scene = Luu.mesh(ngons, {
                        rotation: rotationVector,
                    });

                    const options = {
                        fov: 70,
                        farPlane: 100000000,
                        viewRotation: Luu.rotation(0, 0, 0),
                        viewPosition: Luu.translation(0, 0, -viewDistance),
                    };

                    Luu.render([scene], svgImage, options);
                }

                window.requestAnimationFrame((newTimestamp)=>
                {
                    render_loop(newTimestamp,
                                (newTimestamp - timestamp),
                                (frameCount + 1));
                });
            })();
        }
    });

    return;
}
