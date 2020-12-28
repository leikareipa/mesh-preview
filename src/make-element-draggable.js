/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: Mesh viewer
 * 
 */

"use strict";

// Enables dragging the given element via mouse. Note: The element must have a child of
// the "dragger" class - this is the sub-element that accepts mouse input for dragging.
export function make_element_draggable(targetElement)
{
    const draggerElement = targetElement.querySelector(".dragger");

    if (!draggerElement)
    {
        throw new Error("The draggee is missing a required .dragger child element.");
    }

    const dragStatus = {
        mousePosition: {
            x: 0,
            y: 0,
        },
        dragPosition: {
            x: 0,
            y: 0,
        },
        isDragging: false,
    };

    draggerElement.addEventListener("mousedown", function(event)
    {
        if (event.button !== 0)
        {
            return;
        }

        dragStatus.mousePosition.x = event.clientX;
        dragStatus.mousePosition.y = event.clientY;

        dragStatus.isDragging = true;
        targetElement.classList.add("dragging");

        return;
    });

    window.addEventListener("mouseup", function(event)
    {
        if (event.button !== 0)
        {
            return;
        }
        
        dragStatus.isDragging = false;
        targetElement.classList.remove("dragging");

        return;
    });

    window.addEventListener("mousemove", function(event)
    {
        if (dragStatus.isDragging)
        {
            if (!targetElement.draggingInitialized)
            {
                initialize_dragging();
            }

            dragStatus.dragPosition.x += (event.clientX - dragStatus.mousePosition.x);
            dragStatus.dragPosition.y += (event.clientY - dragStatus.mousePosition.y);

            targetElement.style.top = `${dragStatus.dragPosition.y}px`;
            targetElement.style.left = `${dragStatus.dragPosition.x}px`;
        }

        dragStatus.mousePosition.x = event.clientX;
        dragStatus.mousePosition.y = event.clientY;

        return;
    });

    function initialize_dragging()
    {
        if (!targetElement)
        {
            throw new Error("Unknown target element.");
        }

        const style = window.getComputedStyle(targetElement);
        const left = Number(style.left.replace(/[^\d-.,]+/g, ""));
        const right = Number(style.right.replace(/[^\d-.,]+/g, ""));
        const top = Number(style.top.replace(/[^\d-.,]+/g, ""));
        const bottom = Number(style.bottom.replace(/[^\d-.,]+/g, ""));

        dragStatus.dragPosition.x = (targetElement.style.left? left : (document.body.clientWidth - right - targetElement.getBoundingClientRect().width));
        dragStatus.dragPosition.y = (targetElement.style.top? top : (document.body.clientHeight - bottom - targetElement.getBoundingClientRect().height));

        targetElement.style.right = "";
        targetElement.style.bottom = "";

        targetElement.draggingInitialized = true;

        return;
    }
}
