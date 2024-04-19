import * as React from 'react';
import { FunctionComponent } from 'react';
import ReactFlow, { Controls, Background, ReactFlowProvider, ConnectionMode } from 'reactflow';

const Flow: FunctionComponent<any> = ({ props }) => {
    // props.nodeTypes = nodeTypes;
    props.minZoom = .25;
    props.maxZoom = 1;
    props.autoPanOnConnect = true;
    props.autoPanOnNodeDrag = true;
    props.connectionRadius = 20;
    props.elementsSelectable = true;
    props.elevateNodesOnSelect = true;
    props.fitView = false;
    props.connectOnClick = true;
    props.edgesFocusable = true;
    props.nodesFocusable = true;
    props.nodesDraggable = true;
    props.nodesConnectable = true;
    props.snapToGrid = false;
    props.snapGrid = [15, 15];
    props.nodeOrigin = [0, 0];
    props.noPanClassName = 'nopan';
    props.connectionMode = ConnectionMode.Strict;

    return React.createElement(ReactFlow, {...props},
        React.createElement(Controls),
        React.createElement(Background, {
            color: props.theme == "dark" ? "#383948" : "#dadadf",
            gap: 20,
            size: 2
        })
    );
};

/**
 * ReactFlowProvider fixes some internal context
 * issues with ReactFlow
 */
export const ReactFlowWrappableComponent: FunctionComponent<any> = ({ props }) => {
    return React.createElement(ReactFlow, { ...props } as any,
        React.createElement(Controls, null),
        React.createElement(Background, { color: "#aaa", gap: 16 })
    );
    return React.createElement(ReactFlowProvider,
        React.createElement(Flow, props)
    );
};
