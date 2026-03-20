import { FiX } from "react-icons/fi";
import React from "react";

export default function SelectFilter({showModal, setShowModal, columns, handleFilter, optionsFilter, selectTable}) {
    const [selectedColumn, setSelectedColumn] = React.useState(Object.keys(selectTable.columns)[0]);
    const [operator, setOperator] = React.useState("$lt");
    const [value, setValue] = React.useState("");
    const modalContentRef = React.useRef(null);

    function handleSubmit(e) {
        e.preventDefault();
        if (!selectedColumn || !value) return;
        handleFilter({
            column: selectedColumn,
            operator,
            value
        });
        setSelectedColumn(Object.keys(selectTable.columns)[0]);
        setOperator("$lt");
        setValue("");
        setShowModal(false);
    }

    function handleClickOutside(e) {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
            setShowModal(false);
        }
    }

    return (
        <div
            className={`select-filter ${showModal ? "flex" : "hidden"} 
                        absolute inset-0 h-full bg-black/60
                        flex items-center justify-center`}
            onClick={handleClickOutside}
        >
            <div className="bg-white p-4 rounded-md relative" ref={modalContentRef}>
                <FiX className="absolute top-2 right-2 h-6 w-6 cursor-pointer" size={24} onClick={() => setShowModal(false)} />
                <form onSubmit={handleSubmit}>
                    Filtrer par :
                    <div className="flex">
                        <select
                            value={selectedColumn}
                            onChange={(e) => {
                                setSelectedColumn(e.target.value)
                                setValue(selectTable.date?.[e.target.value] ? new Date().toISOString().slice(0, 10) : '')
                            }}
                        >
                            {columns.map((col, key) => (
                                <option key={key} value={col.accessorKey}>
                                    {col.header}
                                </option>
                            ))}
                        </select>
                        <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value)}
                        >
                            {Object.entries(optionsFilter)
                                .filter(([key, value]) =>
                                    !(selectedColumn === "created_at" && (key === '$eq' || key === '$contains'))
                                )
                                .map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))
                            }
                        </select>
                        <input
                            className={"border-2 border-gray-300 rounded-md focus:outline-none"}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            type={`${selectTable.date?.[selectedColumn] ? 'date' : 'text'}`}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 rounded-md text-white py-1 px-4 cursor-pointer"
                            onClick={handleSubmit}
                            type="submit"
                        >
                            Filtrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}