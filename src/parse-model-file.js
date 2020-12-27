/*
 * 2020 Tarpeeksi Hyvae Soft
 * 
 * Software: xxxx
 *
 */

"use strict";

// Expects the name of a Ka-50 Hokum model file (from the game's "DG" folder). Loads the file's
// data and parses it to return the model's polygon data in an array where each element is one
// mesh and there are as many elements as there are meshes in the file.
export async function get_meshes_from_model_file(modelFileName)
{
    const fileContents = await fetch(`./model-files/${modelFileName}`)
                               .then(response=>response.text());

    const lines = fileContents.split("\n").filter(line=>line.length);

    // Remove the first line, since it appears to be just a file version number or something like that.
    lines.shift();

    // The loaded model goes into this. Each element is a successively
    // LOD-reduced version of the previous element, with the first element
    // giving the full non-reduced model's polygons.
    const model = [];

    while (lines.length)
    {
        const nextLine = lines[0];

        if (nextLine.match(/Shapes [0-9]+/))
        {
            model.push(...parse_block_shapes(lines));
        }
        else if (nextLine.match(/Nodes [0-9]+/))
        {
            parse_block_nodes(lines);
        }
        else
        {
            // We were unable to identify this line, so we'll just ignore it and move on.
            lines.shift();
        }
    }

    return model;
}

function parse_block_nodes(lines)
{
    /// TODO: Implement node parsing. (What are nodes even used for?)
    lines.shift();
}

// A shape is an alias for a 3D model. Each successive shape is a LOD-reduced
// version of the preceding shape.
function parse_block_shapes(lines)
{
    const shapes = [];
    const numShapes = lines.shift().match(/Shapes ([0-9]+)/)[1];

    for (let i = 0; i < numShapes; i++)
    {
        const shape = (()=>
        {
            const vertices = [];
            const faces = [];

            // LOD metadata.
            {
                lines.shift();
            }

            // Vertices.
            {
                const values = lines.shift().match(/(-?[0-9]+)/g);
                const numCoordinates = values.shift();

                for (let v = 0; v < numCoordinates; v++)
                {
                    vertices.push({
                        x: Number(values.shift()),
                        y: Number(values.shift()),
                        z: Number(values.shift()),
                        w: Number(values.shift())
                    });
                }
            }

            // Faces.
            {
                const numVertices = lines.shift();

                for (let v = 0; v < numVertices; v++)
                {
                    const values = lines.shift().match(/([0-9a-fA-F]+)/g);

                    faces.push({
                        textureIdx: parseInt(values.shift(), 16),
                        numVerties: Number(values.shift()),
                        vertices: values.map(v=>vertices[v]),
                    });
                }
            }

            return faces;
        })();

        shapes.push(shape);
    }

    return shapes;
}
