/*
 * 2020 Tarpeeksi Hyvae Soft
 * 
 * Software: Mesh preview
 *
 */

import Vue from "../vue.esm.browser.min.js";

export default Vue.component("rendering", {
    template: `
        <div id="luujanko-rendering-container">

            <svg id="luujanko-rendering"
                 style="pointer-events: none;">
            </svg>

        </div>
    `,
});
