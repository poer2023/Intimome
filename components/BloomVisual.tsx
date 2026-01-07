import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { generateLayerPath, getLayerColor, getStrokeWidth, generateCenterOpening } from '../utils/bloomLogic';

export interface BloomLayerData {
    id: string;
    intensity: number; // 0.0 to 1.0
    label: string;
}

export type TimeFrame = 'Week' | 'Month' | 'Year';

interface BloomVisualProps {
    data: BloomLayerData[];
    timeframe: TimeFrame;
}

export const BloomVisual: React.FC<BloomVisualProps> = ({ data, timeframe }) => {
    const [seed, setSeed] = useState(0);
    const containerControls = useAnimation();
    const glowControls = useAnimation();

    useEffect(() => {
        setSeed(Math.random() * 100);
    }, [timeframe]);

    useEffect(() => {
        containerControls.start("idle");
        glowControls.start("idle");
    }, [timeframe, containerControls, glowControls]);

    const handleInteraction = async () => {
        // 1. Fast Contract (Squeeze horizontally significantly more than vertically)
        const contractPromise = containerControls.start("contract");
        const glowUpPromise = glowControls.start("active");

        await Promise.all([contractPromise, glowUpPromise]);

        // 2. Slow Bloom (Release tension)
        const bloomPromise = containerControls.start("bloom");
        const glowFadePromise = glowControls.start("idle");

        await Promise.all([bloomPromise, glowFadePromise]);

        // 3. Return to Idle
        containerControls.start("idle");
    };

    const totalLayers = data.length;
    const maxRadius = 150;
    const spacing = maxRadius / (totalLayers + 1);

    const centerPath = useMemo(() => generateCenterOpening(), [timeframe]);

    const containerVariants: Variants = {
        idle: {
            // Refined Breathing Logic:
            // To mimic "closing" without full contraction, we squeeze X significantly more than Y.
            // Squeeze Phase: scaleX goes down to 0.92 (narrow), scaleY only to 0.98 (almost same height).
            // Relax Phase: scaleX opens to 1.04, scaleY to 1.02.
            scaleX: [0.92, 1.04, 0.92],
            scaleY: [0.98, 1.02, 0.98],
            transition: {
                duration: 8, // Slow, organic cycle
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
            }
        },
        contract: {
            // Interaction: Rapid, deeper horizontal squeeze
            scaleX: 0.75,
            scaleY: 0.95,
            transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] }
        },
        bloom: {
            // Interaction: Wide expansion release
            scaleX: 1.15,
            scaleY: 1.10,
            transition: { duration: 2.5, ease: "easeOut" }
        }
    };

    const glowVariants: Variants = {
        idle: {
            opacity: 0, // No glow when idle
            scale: 0.9,
            backgroundColor: "rgba(255, 192, 203, 0)",
            transition: { duration: 0.8 }
        },
        active: {
            opacity: 0.7,
            scale: 1.35,
            backgroundColor: "rgba(255, 182, 193, 0.5)", // Soft pink glow
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className="relative w-full h-[350px] flex items-center justify-center cursor-pointer group"
            onMouseEnter={handleInteraction}
            onTap={handleInteraction}
            animate={containerControls}
            variants={containerVariants}
        >
            {/* Background Glow (Only visible on interaction) */}
            <motion.div
                className="absolute inset-0 rounded-full blur-3xl z-0"
                animate={glowControls}
                variants={glowVariants}
                initial="idle"
            />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 400"
                className="overflow-visible relative z-10"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Organic Turbulence Filter */}
                <defs>
                    <filter id="organic-distortion" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.008"
                            numOctaves={3}
                            result="noise"
                        >
                            <animate
                                attributeName="baseFrequency"
                                values="0.008;0.012;0.008"
                                dur="12s"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={6}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>

                <AnimatePresence mode="wait">
                    <motion.g
                        key={timeframe}
                        initial={{ opacity: 0, rotate: -3 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.1, rotate: 3 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ originX: "50%", originY: "50%", filter: "url(#organic-distortion)" }}
                    >
                        {/* The Center Opening */}
                        <motion.path
                            d={centerPath}
                            fill="none"
                            stroke="#FFB6C1"
                            strokeWidth="1.5"
                            className="opacity-80"
                            initial={{ pathLength: 0, scale: 0.8 }}
                            animate={{
                                pathLength: 1,
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                pathLength: { duration: 1.5, ease: "easeInOut" },
                                scale: { duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
                                rotate: { duration: 12, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
                            }}
                            style={{ originX: "50%", originY: "50%" }}
                        />

                        {/* The Layers */}
                        {data.map((layer, index) => {
                            const radiusBase = (index + 1) * spacing + 5;
                            const path = generateLayerPath(radiusBase, layer.intensity, index, totalLayers, seed);
                            const color = getLayerColor(index, totalLayers);
                            const width = getStrokeWidth(layer.intensity);

                            // Organic animation parameters
                            const breatheDuration = 6 + (index * 0.5);
                            const rotateDuration = 20 + (Math.random() * 10);
                            const delay = index * 0.1;

                            // Random slight drift for each layer
                            const driftX = Math.random() * 6 - 3;
                            const driftY = Math.random() * 6 - 3;

                            return (
                                <motion.path
                                    key={`${layer.id}-${timeframe}`}
                                    d={path}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={width}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"

                                    initial={{ pathLength: 0, opacity: 0, scale: 0.95 }}

                                    animate={{
                                        pathLength: 1,
                                        opacity: 1,
                                        scale: [1, 1.02 + (layer.intensity * 0.03), 1],
                                        rotate: [0, 2, -2, 0],
                                        x: [0, driftX, 0],
                                        y: [0, driftY, 0]
                                    }}

                                    transition={{
                                        pathLength: { duration: 2, ease: "easeInOut", delay },
                                        opacity: { duration: 1, delay },
                                        scale: {
                                            duration: breatheDuration,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            delay: delay
                                        },
                                        rotate: {
                                            duration: rotateDuration,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "mirror",
                                            delay: Math.random() * 5
                                        },
                                        x: {
                                            duration: 8 + Math.random() * 5,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "mirror"
                                        },
                                        y: {
                                            duration: 9 + Math.random() * 5,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatType: "mirror"
                                        }
                                    }}

                                    style={{ originX: "50%", originY: "50%" }}
                                    className="transition-colors duration-500"
                                />
                            );
                        })}
                    </motion.g>
                </AnimatePresence>
            </svg>
        </motion.div>
    );
};
