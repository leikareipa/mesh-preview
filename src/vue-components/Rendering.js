/*
 * 2020 Tarpeeksi Hyvae Soft
 * 
 * Software: Mesh preview
 *
 */

import Vue from "../vue.esm.browser.min.js";
import {Luu} from "../luujanko.js";

export default Vue.component("rendering", {
    data: function()
    {
        return {
            frameCount: 0,
            frameTimeDeltaMs: 0,
            rotationVector: Luu.rotation(...this.$store.state.startupArgs.defaultOrientation),
        };
    },
    computed: {
        startupArgs: {
            get: function()
            {
                return this.$store.state.startupArgs;
            },
        },
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

            if (this.startupArgs.continuousRendering)
            {
                this.rotationVector.x += (this.startupArgs.rotationDelta[0] * this.frameTimeDeltaMs);
                this.rotationVector.y += (this.startupArgs.rotationDelta[1] * this.frameTimeDeltaMs);
                this.rotationVector.z += (this.startupArgs.rotationDelta[2] * this.frameTimeDeltaMs);
            }

            const ngons = (this.$store.state.activeMeshNgons || []);
            const viewDistance = (this.$store.state.viewDistance || this.startupArgs.defaultViewDistance);

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
        if (this.startupArgs.continuousRendering)
        {
            const self = this;

            (function screen_refresh_loop(timestamp = 0, frameTimeDeltaMs = 0, frameCount = 0)
            {
                self.frameCount++;
                self.frameTimeDeltaMs = frameTimeDeltaMs;

                window.requestAnimationFrame((newTimestamp)=>
                {
                    screen_refresh_loop(newTimestamp,
                                        (newTimestamp - timestamp),
                                        (frameCount + 1));
                });
            })();
        }
    },
    template: `
        <div id="luujanko-rendering-container">

            <svg id="luujanko-rendering"
                 style="pointer-events: none;">
            </svg>

        </div>
    `,
});
