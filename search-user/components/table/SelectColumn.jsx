"use client"

import * as React from "react";
import { Popover } from "radix-ui";
import { FiX } from "react-icons/fi";

export default function SelectColumn({columnVisibility, setColumnVisibility, selectedTable}) {

    function getLabel(columns, key) {
        return key.split('.').reduce((acc, part) => acc?.[part], columns);
    }

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={"bg-gray-400 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2"} aria-label="Update dimensions">
                    Colonne
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={"bg-gray-400 p-3 rounded-lg"} sideOffset={5}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <p className="Text" style={{ marginBottom: 10 }}>
                            Colonnes visualisées
                        </p>
                        {Object.entries(columnVisibility).map(([key, checked]) => (
                            <div key={key} className={"flex items-center gap-2"}>
                                <input type={"checkbox"} checked={!!checked}
                                       onChange={() => {
                                           setColumnVisibility(prev => ({
                                               ...prev,
                                               [key]: !prev[key]
                                           }));
                                       }}
                                />
                                <label htmlFor={key}>{getLabel(selectedTable.columns, key) ?? key}</label>
                            </div>
                        ))}
                    </div>
                    <Popover.Close className={"inline-flex items-center justify-center absolute top-1 right-1 cursor-pointer"} aria-label="Close">
                        <FiX />
                    </Popover.Close>
                    <Popover.Arrow className="PopoverArrow" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}