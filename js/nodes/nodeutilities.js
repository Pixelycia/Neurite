

// Global array for selected UUIDs
let selectedNodeUUIDs = new Set();

// Function to toggle node selection
function toggleNodeSelection(node) {
    if (selectedNodeUUIDs.has(node.uuid)) {
        node.windowDiv.classList.toggle('selected');
        selectedNodeUUIDs.delete(node.uuid); // Deselect
        //console.log(`deselected`);
    } else {
        node.windowDiv.classList.toggle('selected');
        selectedNodeUUIDs.add(node.uuid); // Select
        //console.log(`selected`);
    }
}

function clearNodeSelection() {
    selectedNodeUUIDs.forEach(uuid => {
        const node = findNodeByUUID(uuid); // Implement this function based on how your nodes are stored
        if (node) {
            node.windowDiv.classList.remove('selected');
        }
    });
    selectedNodeUUIDs.clear(); // Clear the set of selected UUIDs
}

function getCentroidOfSelectedNodes() {
    const selectedNodes = getSelectedNodes();
    if (selectedNodes.length === 0) return null;

    let sumPos = new vec2(0, 0);
    selectedNodes.forEach(node => {
        sumPos = sumPos.plus(node.pos);
    });
    return sumPos.scale(1 / selectedNodes.length);
}

function scaleSelectedNodes(scaleFactor, centralPoint) {
    const selectedNodes = getSelectedNodes();

    selectedNodes.forEach(node => {
        // Scale the node
        node.scale *= scaleFactor;


        // Adjust position to maintain relative spacing only if the node is not anchored
        if (node.anchorForce !== 1) {
            let directionToCentroid = node.pos.minus(centralPoint);
            node.pos = centralPoint.plus(directionToCentroid.scale(scaleFactor));
        }

        updateNodeEdgesLength(node);
    });

    // If needed, scale the user screen (global zoom)
    //zoom = zoom.scale(scaleFactor);
    //pan = centralPoint.scale(1 - scaleFactor).plus(pan.scale(scaleFactor));
}

function findNodeByUUID(uuid) {
    return nodes.find(node => node.uuid === uuid);
}

function getSelectedNodes() {
    // Return an array of node objects based on the selected UUIDs
    return Array.from(selectedNodeUUIDs).map(uuid => nodeMap[uuid]);
}

function getNodeByTitle(title) {
    const lowerCaseTitle = title.toLowerCase();
    let matchingNodes = [];

    for (let n of nodes) {
        let nodeTitle = n.getTitle();

        if (nodeTitle !== null && nodeTitle.toLowerCase() === lowerCaseTitle) {
            matchingNodes.push(n);
        }
    }

    // Debugging: Show all matching nodes and their count
    //console.log(`Found ${matchingNodes.length} matching nodes for title ${title}.`);
    //console.log("Matching nodes:", matchingNodes);

    return matchingNodes.length > 0 ? matchingNodes[0] : null;
}

function getTextareaContentForNode(node) {
    if (!node || !node.content) {
        // console.warn('Node or node.content is not available');
        return null;
    }

    if (!node.isTextNode) {
        // console.warn('Node is not a text node. Skipping text area and editable div logic.');
        return null;
    }

    const editableDiv = node.contentEditableDiv;
    const hiddenTextarea = node.textarea;
    //console.log(editableDiv, hiddenTextarea);
    if (!editableDiv || !hiddenTextarea) {
        console.warn('Either editableDiv or hiddenTextarea is not found.');
        return null;
    }

    // Explicitly sync the content
    syncTextareaWithContentEditable(hiddenTextarea, editableDiv);

    hiddenTextarea.dispatchEvent(new Event('input'));
    // Now get the textarea content
    if (hiddenTextarea) {
        return hiddenTextarea.value;
    } else {
        console.warn('Textarea not found in node');
        return null;
    }
}

function testNodeText(title) {
    const node = getNodeByTitle(title);
    if (node) {
        console.log(`Fetching text for node with title: ${title}`);
        const text = getTextareaContentForNode(node);
        console.log(`Text fetched: ${text}`);
        return text;
    } else {
        console.warn(`Node with title ${title} not found`);
        return null;
    }
}

function getNodeText() {
    const nodes = [];
    for (const child of htmlnodes_parent.children) {
        if (child.firstChild && child.firstChild.win) {
            const node = child.firstChild.win;

            const titleInput = node.content.querySelector("input.title-input");
            //console.log(`Title Input for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, titleInput); // Debugging line

            const contentText = getTextareaContentForNode(node);
            //console.log(`Content Text for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, contentText); // Debugging line

            nodes.push({
                ...node,
                titleInput: titleInput ? titleInput.value : '',
                contentText: contentText ? contentText : ''
            });
        } else {
            console.warn('Node or child.firstChild.win not found'); // Debugging line
        }
    }
    return nodes;
}