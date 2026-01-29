import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value }) {
    // 1. Remove non-numeric chars (except dot)
    const numericValue = parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));
    const isCurrency = value.toString().includes("$");

    // 2. Spring animation
    const spring = useSpring(0, { mass: 1, stiffness: 75, damping: 15 });

    // 3. Update spring target when value changes
    useEffect(() => {
        spring.set(numericValue);
    }, [spring, numericValue]);

    // 4. Transform spring value back to display string
    const display = useTransform(spring, (current) => {
        if (isNaN(current)) return "0";
        // Format with commas, maintain decimals if original had them
        const formatted = current.toLocaleString('en-US', {
            minimumFractionDigits: value.toString().includes(".") ? 1 : 0,
            maximumFractionDigits: 1
        });
        return isCurrency ? `$${formatted}` : formatted;
    });

    return <motion.span>{display}</motion.span>;
}

export default function MetricCard({ title, value, icon: Icon, trend, trendValue, color = "blue" }) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <motion.div
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 cursor-default"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2 dark:text-white">
                        <AnimatedNumber value={value} />
                    </h3>
                </div>
                <div className={clsx("p-3 rounded-lg", colorStyles[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={clsx(
                        "flex items-center font-medium",
                        trend === "up" ? "text-green-600" : "text-red-600"
                    )}>
                        {trend === "up" ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {trendValue}
                    </span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                </div>
            )}
        </motion.div>
    );
}
