/*
 * 2020 Tarpeeksi Hyvae Soft
 * 
 * Software: Mesh preview
 *
 */

import Vue from "../vue.esm.browser.min.js";
import {make_element_draggable} from "../make-draggable.js";

export default Vue.component("control-panel", {
    mounted()
    {
        // Note: make_draggable() needs to know the target element's initial size,
        // so it shouldn't be called until the element has been initialized - which
        // is why we call it in this hook.
        make_element_draggable(document.getElementById("control-panel"));
    },
    computed: {
        viewDistance: {
            get()
            {
                return this.$store.state.viewDistance;
            },
            set(value)
            {
                this.$store.commit("set_render_distance", value);
            }
        },
        activeMeshIdx: {
            get()
            {
                return this.$store.state.activeMeshIdx;
            },
            set(value)
            {
                this.$store.commit("set_mesh_idx", value);
            }
        },
    },
    template: `
    <div id="control-panel">

        <div class="dragger">

            <!-- This is used for mouse dragging; the dragger script attaches itself here. -->
            
        </div>

        <div class="control-panel-field">

            <span>Mesh</span>

            <select v-model="activeMeshIdx">

                <option v-for="(model, idx) in this.$store.state.knownMeshes"
                        v-bind:value="idx"
                        v-bind:key="model.name">

                    {{model.name}}

                </option>

            </select>

        </div>
        
        <div class="control-panel-field">

            <span>
            
                View distance
            
            </span>

            <input type="number"
                   step="any"
                   v-model="viewDistance">

        </div>

    </div>
    `,
});
