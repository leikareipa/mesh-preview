/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: Mesh preview
 * 
 */

"use strict";

// Enables dragging the given element via mouse. Note: The element must have a child of
// the "dragger" class - this is the sub-element that accepts mouse input for dragging.
//
// Will append "dragging" to the element's class list while the element is being dragged.
export function make_element_draggable(targetElement)
{
    const draggerElement = targetElement.querySelector(".dragger");

    if (!draggerElement)
    {
        throw new Error("The draggee is missing a required .dragger child element.");
    }

    const dragStatus = {
        windowSize: {
            x: 0,
            y: 0,
        },
        mousePosition: {
            x: 0,
            y: 0,
        },
        dragPosition: {
            x: 0,
            y: 0,
        },
        isDragging: false,
        isInitialized: false,
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

    window.addEventListener("resize", function(event)
    {
        if (!dragStatus.isInitialized)
        {
            return;
        }
        
        const deltaX = (document.body.clientWidth - dragStatus.windowSize.x);

        dragStatus.windowSize.x = document.body.clientWidth;
        dragStatus.windowSize.y = document.body.clientHeight;

        dragStatus.dragPosition.x += deltaX;

        update_element_position();

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
            if (!dragStatus.isInitialized)
            {
                initialize_dragging();
            }

            dragStatus.dragPosition.x += (event.clientX - dragStatus.mousePosition.x);
            dragStatus.dragPosition.y += (event.clientY - dragStatus.mousePosition.y);

            update_element_position();
        }

        dragStatus.mousePosition.x = event.clientX;
        dragStatus.mousePosition.y = event.clientY;

        return;
    });

    function update_element_position()
    {
        targetElement.style.top = `${dragStatus.dragPosition.y}px`;
        targetElement.style.left = `${dragStatus.dragPosition.x}px`;

        return;
    }

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

        dragStatus.windowSize.x = document.body.clientWidth;
        dragStatus.windowSize.y = document.body.clientHeight;

        targetElement.style.right = "";
        targetElement.style.bottom = "";

        dragStatus.isInitialized = true;

        return;
    }
}
