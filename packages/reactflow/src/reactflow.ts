import * as React from 'react';
import { FunctionComponent, ReactEventHandler } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineComponent,
  ConnectionLineType,
  ConnectionMode,
  CoordinateExtent,
  DefaultEdgeOptions,
  EdgeMouseHandler,
  EdgeTypes,
  FitViewOptions,
  HandleType,
  KeyCode,
  NodeDragHandler,
  NodeMouseHandler,
  NodeOrigin,
  NodeTypes,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnEdgesChange,
  OnEdgesDelete,
  OnEdgeUpdateFunc,
  OnError,
  OnInit,
  OnMove,
  OnNodesChange,
  OnNodesDelete,
  OnSelectionChangeFunc,
  PanelPosition,
  PanOnScrollMode,
  ProOptions,
  SelectionDragHandler,
  Viewport,
} from 'reactflow';

import { nodes as initialNodes, edges as initialEdges } from './initial-elements';
// import CustomNode from './custom-node';

// import './MyReactComponent.scss';

export interface IReactFlowProps {
    props: {
        nodes?: Node<any, string | undefined>[] | undefined;
        edges?: Edge<any>[] | undefined;
        defaultNodes?: Node<any, string | undefined>[] | undefined;
        defaultEdges?: Edge<any>[] | undefined;
        defaultEdgeOptions?: DefaultEdgeOptions | undefined;
        onNodeClick?: NodeMouseHandler | undefined;
        onNodeDoubleClick?: NodeMouseHandler | undefined;
        onNodeMouseEnter?: NodeMouseHandler | undefined;
        onNodeMouseMove?: NodeMouseHandler | undefined;
        onNodeMouseLeave?: NodeMouseHandler | undefined;
        onNodeContextMenu?: NodeMouseHandler | undefined;
        onNodeDragStart?: NodeDragHandler | undefined;
        onNodeDrag?: NodeDragHandler | undefined;
        onNodeDragStop?: NodeDragHandler | undefined;
        onEdgeClick?: ((event: import("react").MouseEvent<Element, MouseEvent>, node: Edge<any>) => void) | undefined;
        onEdgeUpdate?: OnEdgeUpdateFunc<any> | undefined;
        onEdgeContextMenu?: EdgeMouseHandler | undefined;
        onEdgeMouseEnter?: EdgeMouseHandler | undefined;
        onEdgeMouseMove?: EdgeMouseHandler | undefined;
        onEdgeMouseLeave?: EdgeMouseHandler | undefined;
        onEdgeDoubleClick?: EdgeMouseHandler | undefined;
        onEdgeUpdateStart?: ((event: import("react").MouseEvent<Element, MouseEvent>, edge: Edge<any>, handleType: HandleType) => void) | undefined;
        onEdgeUpdateEnd?: ((event: MouseEvent | TouchEvent, edge: Edge<any>, handleType: HandleType) => void) | undefined;
        onNodesChange?: OnNodesChange | undefined;
        onEdgesChange?: OnEdgesChange | undefined;
        onNodesDelete?: OnNodesDelete | undefined;
        onEdgesDelete?: OnEdgesDelete | undefined;
        onSelectionDragStart?: SelectionDragHandler | undefined;
        onSelectionDrag?: SelectionDragHandler | undefined;
        onSelectionDragStop?: SelectionDragHandler | undefined;
        onSelectionStart?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onSelectionEnd?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onSelectionContextMenu?: ((event: import("react").MouseEvent<Element, MouseEvent>, nodes: Node<any, string | undefined>[]) => void) | undefined;
        onConnect?: OnConnect | undefined;
        onConnectStart?: OnConnectStart | undefined;
        onConnectEnd?: OnConnectEnd | undefined;
        onClickConnectStart?: OnConnectStart | undefined;
        onClickConnectEnd?: OnConnectEnd | undefined;
        onInit?: OnInit<any, any> | undefined;
        onMove?: OnMove | undefined;
        onMoveStart?: OnMove | undefined;
        onMoveEnd?: OnMove | undefined;
        onSelectionChange?: OnSelectionChangeFunc | undefined;
        onPaneScroll?: ((event?: import("react").WheelEvent<Element> | undefined) => void) | undefined;
        onPaneClick?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onPaneContextMenu?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onPaneMouseEnter?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onPaneMouseMove?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        onPaneMouseLeave?: ((event: import("react").MouseEvent<Element, MouseEvent>) => void) | undefined;
        nodeTypes?: NodeTypes | undefined;
        edgeTypes?: EdgeTypes | undefined;
        connectionLineType?: ConnectionLineType | undefined;
        connectionLineStyle?: React.CSSProperties | undefined;
        connectionLineComponent?: ConnectionLineComponent | undefined;
        connectionLineContainerStyle?: React.CSSProperties | undefined;
        connectionMode?: ConnectionMode | undefined;
        deleteKeyCode?: KeyCode | null | undefined;
        selectionKeyCode?: KeyCode | null | undefined;
        selectionOnDrag?: boolean | undefined;
        selectionMode?: SelectionMode | undefined;
        panActivationKeyCode?: KeyCode | null | undefined;
        multiSelectionKeyCode?: KeyCode | null | undefined;
        zoomActivationKeyCode?: KeyCode | null | undefined;
        snapToGrid?: boolean | undefined;
        snapGrid?: [number, number] | undefined;
        onlyRenderVisibleElements?: boolean | undefined;
        nodesDraggable?: boolean | undefined;
        nodesConnectable?: boolean | undefined;
        nodesFocusable?: boolean | undefined;
        nodeOrigin?: NodeOrigin | undefined;
        edgesFocusable?: boolean | undefined;
        elementsSelectable?: boolean | undefined;
        selectNodesOnDrag?: boolean | undefined;
        panOnDrag?: boolean | number[] | undefined;
        minZoom?: number | undefined;
        maxZoom?: number | undefined;
        defaultViewport?: Viewport | undefined;
        translateExtent?: CoordinateExtent | undefined;
        preventScrolling?: boolean | undefined;
        nodeExtent?: CoordinateExtent | undefined;
        defaultMarkerColor?: string | undefined;
        zoomOnScroll?: boolean | undefined;
        zoomOnPinch?: boolean | undefined;
        panOnScroll?: boolean | undefined;
        panOnScrollSpeed?: number | undefined;
        panOnScrollMode?: PanOnScrollMode | undefined;
        zoomOnDoubleClick?: boolean | undefined;
        edgeUpdaterRadius?: number | undefined;
        noDragClassName?: string | undefined;
        noWheelClassName?: string | undefined;
        noPanClassName?: string | undefined;
        fitView?: boolean | undefined;
        fitViewOptions?: FitViewOptions | undefined;
        connectOnClick?: boolean | undefined;
        attributionPosition?: PanelPosition | undefined;
        proOptions?: ProOptions | undefined;
        elevateNodesOnSelect?: boolean | undefined;
        elevateEdgesOnSelect?: boolean | undefined;
        disableKeyboardA11y?: boolean | undefined;
        autoPanOnNodeDrag?: boolean | undefined;
        autoPanOnConnect?: boolean | undefined;
        connectionRadius?: number | undefined;
        onError?: ReactEventHandler<HTMLDivElement> & OnError | undefined;
    }
}

export const ReactFlowWrappableComponent: FunctionComponent<IReactFlowProps> = ({props}) => {

    // Inputs from Angular

    const minimapStyle = {
        height: 120,
    };

    const onInit = (reactFlowInstance) => console.log('flow loaded:', reactFlowInstance);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);
    const onConnect = React.useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    return React.createElement(ReactFlow, { ...props } as any,
        React.createElement(MiniMap, { style: minimapStyle, zoomable: true, pannable: true }),
        React.createElement(Controls, null),
        React.createElement(Background, { color: "#aaa", gap: 16 })
    );

    // return (
        // <ReactFlow
        //     nodes={props.nodes}
        //     edges={props.edges}
        //     defaultNodes={props.defaultNodes}
        //     defaultEdges={props.defaultEdges}
        //     defaultEdgeOptions={props.defaultEdgeOptions}
        //     onNodeClick={props.onNodeClick}
        //     onNodeDoubleClick={props.onNodeDoubleClick}
        //     onNodeMouseEnter={props.onNodeMouseEnter}
        //     onNodeMouseMove={props.onNodeMouseMove}
        //     onNodeMouseLeave={props.onNodeMouseLeave}
        //     onNodeContextMenu={props.onNodeContextMenu}
        //     onNodeDragStart={props.onNodeDragStart}
        //     onNodeDrag={props.onNodeDrag}
        //     onNodeDragStop={props.onNodeDragStop}
        //     onEdgeClick={props.onEdgeClick}
        //     onEdgeUpdate={props.onEdgeUpdate}
        //     onEdgeContextMenu={props.onEdgeContextMenu}
        //     onEdgeMouseEnter={props.onEdgeMouseEnter}
        //     onEdgeMouseMove={props.onEdgeMouseMove}
        //     onEdgeMouseLeave={props.onEdgeMouseLeave}
        //     onEdgeDoubleClick={props.onEdgeDoubleClick}
        //     onEdgeUpdateStart={props.onEdgeUpdateStart}
        //     onEdgeUpdateEnd={props.onEdgeUpdateEnd}
        //     onNodesChange={props.onNodesChange}
        //     onEdgesChange={props.onEdgesChange}
        //     onNodesDelete={props.onNodesDelete}
        //     onEdgesDelete={props.onEdgesDelete}
        //     onSelectionDragStart={props.onSelectionDragStart}
        //     onSelectionDrag={props.onSelectionDrag}
        //     onSelectionDragStop={props.onSelectionDragStop}
        //     onSelectionStart={props.onSelectionStart}
        //     onSelectionEnd={props.onSelectionEnd}
        //     onSelectionContextMenu={props.onSelectionContextMenu}
        //     onConnect={props.onConnect}
        //     onConnectStart={props.onConnectStart}
        //     onConnectEnd={props.onConnectEnd}
        //     onClickConnectStart={props.onClickConnectStart}
        //     onClickConnectEnd={props.onClickConnectEnd}
        //     onInit={props.onInit}
        //     onMove={props.onMove}
        //     onMoveStart={props.onMoveStart}
        //     onMoveEnd={props.onMoveEnd}
        //     onSelectionChange={props.onSelectionChange}
        //     onPaneScroll={props.onPaneScroll}
        //     onPaneClick={props.onPaneClick}
        //     onPaneContextMenu={props.onPaneContextMenu}
        //     onPaneMouseEnter={props.onPaneMouseEnter}
        //     onPaneMouseMove={props.onPaneMouseMove}
        //     onPaneMouseLeave={props.onPaneMouseLeave}
        //     nodeTypes={props.nodeTypes}
        //     edgeTypes={props.edgeTypes}
        //     connectionLineType={props.connectionLineType}
        //     connectionLineStyle={props.connectionLineStyle}
        //     connectionLineComponent={props.connectionLineComponent}
        //     connectionLineContainerStyle={props.connectionLineContainerStyle}
        //     connectionMode={props.connectionMode}
        //     deleteKeyCode={props.deleteKeyCode}
        //     selectionKeyCode={props.selectionKeyCode}
        //     selectionOnDrag={props.selectionOnDrag}
        //     panActivationKeyCode={props.panActivationKeyCode}
        //     multiSelectionKeyCode={props.multiSelectionKeyCode}
        //     zoomActivationKeyCode={props.zoomActivationKeyCode}
        //     snapToGrid={props.snapToGrid}
        //     snapGrid={props.snapGrid}
        //     onlyRenderVisibleElements={props.onlyRenderVisibleElements}
        //     nodesDraggable={props.nodesDraggable}
        //     nodesConnectable={props.nodesConnectable}
        //     nodesFocusable={props.nodesFocusable}
        //     nodeOrigin={props.nodeOrigin}
        //     edgesFocusable={props.edgesFocusable}
        //     elementsSelectable={props.elementsSelectable}
        //     selectNodesOnDrag={props.selectNodesOnDrag}
        //     panOnDrag={props.panOnDrag}
        //     minZoom={props.minZoom}
        //     maxZoom={props.maxZoom}
        //     defaultViewport={props.defaultViewport}
        //     translateExtent={props.translateExtent}
        //     preventScrolling={props.preventScrolling}
        //     nodeExtent={props.nodeExtent}
        //     defaultMarkerColor={props.defaultMarkerColor}
        //     zoomOnScroll={props.zoomOnScroll}
        //     zoomOnPinch={props.zoomOnPinch}
        //     panOnScroll={props.panOnScroll}
        //     panOnScrollSpeed={props.panOnScrollSpeed}
        //     panOnScrollMode={props.panOnScrollMode}
        //     zoomOnDoubleClick={props.zoomOnDoubleClick}
        //     edgeUpdaterRadius={props.edgeUpdaterRadius}
        //     noDragClassName={props.noDragClassName}
        //     noWheelClassName={props.noWheelClassName}
        //     noPanClassName={props.noPanClassName}
        //     fitView={props.fitView}
        //     fitViewOptions={props.fitViewOptions}
        //     connectOnClick={props.connectOnClick}
        //     attributionPosition={props.attributionPosition}
        //     proOptions={props.proOptions}
        //     elevateNodesOnSelect={props.elevateNodesOnSelect}
        //     elevateEdgesOnSelect={props.elevateEdgesOnSelect}
        //     disableKeyboardA11y={props.disableKeyboardA11y}
        //     autoPanOnNodeDrag={props.autoPanOnNodeDrag}
        //     autoPanOnConnect={props.autoPanOnConnect}
        //     connectionRadius={props.connectionRadius}
        //     onError={props.onError}
        //     >
        //     <MiniMap style={minimapStyle} zoomable pannable />
        //     <Controls />
        //     <Background color="#aaa" gap={16} />
        // </ReactFlow>
    // );
}
