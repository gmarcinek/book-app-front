import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useGraphViewContext } from '../../GraphView.context';
import { GraphDataFilters } from '../GraphDataFilters/GraphDataFilters';
import styles from './NetworkView.module.scss';

const ENTITY_COLORS = [
    '#DC143C', '#32CD32', '#800080', '#87CEEB', '#FF4500',
    '#FFD700', '#00FFFF', '#FF1493', '#4B0082'
];

const NODE_RADIUS = 8;
const PADDING = 50;

// Proper D3 v7 types
interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    type: string;
    confidence: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    relation_type: string;
    confidence: number;
}

export function NetworkView() {
    const svgRef = useRef<SVGSVGElement>(null);
    const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
    const { data, selectedEntityTypes, setSelectedEntity } = useGraphViewContext();

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const container = svg.append('g').attr('class', 'graph-container');
        const rect = svgRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Prepare data
        const filteredNodes = selectedEntityTypes.length > 0
            ? data.nodes.filter(node => selectedEntityTypes.includes(node.type))
            : data.nodes;

        const nodeMap = new Map(filteredNodes.map(node => [node.id, node]));
        const filteredEdges = data.edges.filter(edge =>
            nodeMap.has(edge.source_id) && nodeMap.has(edge.target_id)
        );

        const entityTypes = [...new Set(data.nodes.map(n => n.type))];

        // Convert to proper D3 types
        const nodes: GraphNode[] = filteredNodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            confidence: node.confidence
        }));

        const links: GraphLink[] = filteredEdges.map(edge => ({
            source: edge.source_id,
            target: edge.target_id,
            relation_type: edge.relation_type,
            confidence: edge.confidence
        }));

        // Create simulation with proper types
        const simulation = d3.forceSimulation<GraphNode>(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(links)
                .id(d => d.id)
                .distance(100)
            )
            .force('charge', d3.forceManyBody<GraphNode>().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide<GraphNode>(NODE_RADIUS + 5))
            .force('boundary', () => {
                nodes.forEach(node => {
                    if (node.x !== undefined && node.y !== undefined) {
                        node.x = Math.max(PADDING, Math.min(width - PADDING, node.x));
                        node.y = Math.max(PADDING, Math.min(height - PADDING, node.y));
                    }
                });
            });

        simulationRef.current = simulation;

        // Zoom
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Create links
        const link = container.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#666')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2);

        // Create link labels
        const linkLabels = container.append('g')
            .selectAll('text')
            .data(links)
            .join('text')
            .attr('font-size', '10px')
            .attr('fill', '#999')
            .attr('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .text(d => d.relation_type);

        // Create nodes
        const node = container.append('g')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', NODE_RADIUS)
            .attr('fill', d => {
                const typeIndex = entityTypes.indexOf(d.type);
                return ENTITY_COLORS[typeIndex % ENTITY_COLORS.length];
            })
            .attr('stroke', d => {
                const typeIndex = entityTypes.indexOf(d.type);
                const baseColor = ENTITY_COLORS[typeIndex % ENTITY_COLORS.length];
                return d3.color(baseColor)?.brighter(0.5)?.toString() || baseColor;
            })
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

        // Create node labels
        const nodeLabels = container.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('font-size', '12px')
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('pointer-events', 'none')
            .text(d => d.name);

        // Drag functions
        function dragStarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnded(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Add interactions
        const dragBehavior = d3.drag<SVGCircleElement, GraphNode>()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded);

        node
            .call(dragBehavior as any) // Type casting aby ominąć problem z typami
            .on('click', (event, d) => {
                setSelectedEntity(d.id);
            });

        // Update positions
        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as GraphNode).x!)
                .attr('y1', d => (d.source as GraphNode).y!)
                .attr('x2', d => (d.target as GraphNode).x!)
                .attr('y2', d => (d.target as GraphNode).y!);

            linkLabels
                .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
                .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

            node
                .attr('cx', d => d.x!)
                .attr('cy', d => d.y!);

            nodeLabels
                .attr('x', d => d.x!)
                .attr('y', d => d.y!);
        });

        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };

    }, [data, selectedEntityTypes, setSelectedEntity]);

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <h2>No data available</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <GraphDataFilters />
            <div className={styles.networkContainer}>
                <svg
                    ref={svgRef}
                    className={styles.networkSvg}
                    width="100%"
                    height="100%"
                />
            </div>
        </div>
    );
}