import * as React from 'react';
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow';

const options = [
    {
        value: 'smoothstep',
        label: 'Smoothstep',
    },
    {
        value: 'step',
        label: 'Step',
    },
    {
        value: 'default',
        label: 'Bezier (default)',
    },
    {
        value: 'straight',
        label: 'Straight',
    },
];

function Select({ value, handleId, nodeId }) {
    const { setNodes } = useReactFlow();
    const store = useStoreApi();

    const onChange = (evt) => {
        const { nodeInternals } = store.getState();
        setNodes(
            Array.from(nodeInternals.values()).map((node: any) => {
                if (node.id === nodeId) {
                    node.data = {
                        ...node.data,
                        selects: {
                            ...node.data.selects,
                            [handleId]: evt.target.value,
                        },
                    };
                }

                return node;
            })
        );
    };

    return React.createElement(
        "div",
        { className: "custom-node__select" },
        React.createElement(
            "div",
            null,
            "Edge Type"
        ),
        React.createElement(
            "select",
            { className: "nodrag", onChange: onChange, value: value },
            options.map(option => React.createElement(
                "option",
                { key: option.value, value: option.value },
                option.label
            ))
        ),
        React.createElement(Handle, { type: "source", position: Position.Left, id: handleId })
    );
}

function CustomNode({ id, data }) {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "div",
            { className: "custom-node__header" },
            "This is a ",
            React.createElement(
                "strong",
                null,
                "custom node"
            )
        ),
        React.createElement(
            "div",
            { className: "custom-node__body" },
            Object.keys(data.selects).map(handleId => React.createElement(Select, { key: handleId, nodeId: id, value: data.selects[handleId], handleId: handleId }))
        )
    );
}

export default CustomNode;
