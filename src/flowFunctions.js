import { removeChildren } from './api';

export function fitViewToFlow() {
    const flow = document.querySelector('.react-flow__viewport');
    if (flow) {
        const { width, height } = flow.getBoundingClientRect();
        const x = (width - 100) / 2;
        const y = (height - 100) / 2;
        flow.scrollTo(x, y);
    }
} export function handleEdgeRemoval(oldEdges, id) {
    const edgeToRemove = oldEdges.find((edge) => edge.id === id);
    console.log('Edge to remove: ', edgeToRemove);

    function getIdParts(handle) {
        const [idsPart] = handle.split("out-child-").slice(1);     // "24da…-on-ed64…"
        if (!idsPart) {
            console.log("Invalid handle format:", handle);
            return { parentId: null, childId: null };
        }
        const [parentId, childId] = idsPart?.split("-on-");

        if (!parentId || !childId) {
            console.log("Invalid handle format:", handle);
            console.log("Parent ID:", parentId, "Child ID:", childId);
            console.log(idsPart);
            return { parentId: null, childId: null };
        }

        return { parentId, childId };
    }

    if (edgeToRemove) {
        let parentId = edgeToRemove.source;
        let childId = edgeToRemove.target;

        // Check for our custom handles
        if (edgeToRemove.sourceHandle?.startsWith('out-child-')) {
            // out-child-<parent>-on-<child>
            const ids = getIdParts(edgeToRemove.sourceHandle);
            parentId = ids.parentId;

        } else if (edgeToRemove.targetHandle?.startsWith('in-child-')) {
            // in-child-<child>-on-<parent>
            const ids = getIdParts(edgeToRemove.targetHandle);
            childId = ids.childId;
        }

        console.log('Parent ID:', parentId, 'Child ID:', childId);


        // Call your API to remove children using the extracted source/target.
        removeChildren(parentId, [childId])
            .then((response) => {
                if (response) {
                    console.log("Children removed successfully.");
                } else {
                    alert("Failed to remove children.");
                }
            })
            .catch((error) => {
                console.error("Error removing children:", error);
                alert("Failed to remove children.");
            });
    }
}
// Custom hook for managing context menu logic

export function displayContextMenu(menuRef, event, node, wrapperRef) {
    const menu = menuRef.current;
    if (!menu || !wrapperRef.current) return;

    // remove hidden class, show menu
    menu.classList.remove("hidden");
    menu.classList.add("block");

    const rect = wrapperRef.current.getBoundingClientRect();
    menu.style.left = `${event.clientX - rect.left}px`;
    menu.style.top = `${event.clientY - rect.top}px`;
    // force display:block even in the face of display:none!important
    menu.style.setProperty("display", "block", "important");

    menu.dataset.nodeId = node.data.id;
}
export function requestRefreshChannel() {
    console.log('Request to refresh channel:');
    // Instead of calling API, notify grid
    const channel = new BroadcastChannel('requestRefreshChannel');
    channel.postMessage({});
    channel.close(); // Optional: or keep open if used elsewhere
}
export function handleEdgeConnection(params) {
    const { connectionParams, setEdges, addEdge } = params;
    // Add the edge with animated property
    setEdges((eds) => addEdge({ ...connectionParams, animated: true }, eds));
}
export function requestAddChild(parentId, selectedIds) {
    console.log('Request to add child:', parentId, selectedIds);

    // Instead of calling API, notify grid
    const channel = new BroadcastChannel('addChildChannel');
    channel.postMessage({ parentId, selectedIds });
    channel.close(); // Optional: or keep open if used elsewhere
}

