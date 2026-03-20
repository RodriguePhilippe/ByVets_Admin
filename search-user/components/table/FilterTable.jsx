"use client";

import React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { BsChevronDown } from "react-icons/bs";
import { BsChevronUp } from "react-icons/bs";
import { BsChevronExpand } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import SelectFilter from "@/components/table/SelectFilter";
import Link from 'next/link';

const columnHelper = createColumnHelper();

export default function FilterTable({selectTable, type}) {
    const [data, setData] = React.useState([]);
    const [baseUrl, setBaseUrl] = React.useState(selectTable.url);
    const [currentUrl, setCurrentUrl] = React.useState(baseUrl);
    const [link, setLink] = React.useState([]);
    const [columns, setColumns] = React.useState(
        Object.entries(selectTable.columns).map(([key, label]) =>
            columnHelper.accessor(key, { header: label })
        )
    );

    const [sortingTable, setSortingTable] = React.useState(
        Object.keys(selectTable.columns).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {})
    );
    const [page, setPage] = React.useState(1);
    const [maxPage, setMaxPage] = React.useState(1);
    const [showModal, setShowModal] = React.useState(false);
    const [hasFilter, setHasFilter] = React.useState(false);
    const [currentFilter, setCurrentFilter] = React.useState([]);
    const optionsFilter = {
        $lt: "Inférieur",
        $eq: "Egal",
        $contains: "Contiens",
        $gte: "Supérieur",
    }

    React.useEffect(() => {
        setBaseUrl(selectTable.url);
        setCurrentUrl(selectTable.url);
        setLink(selectTable.link);
        setHasFilter(false);
        setCurrentFilter([]);

        function createColumnHelper(key, label, path = null) {
            if (path && path.length > 0) {
                return columnHelper.accessor(row => {
                    return path.reduce((acc, k) => acc?.[k], row);
                }, {
                    header: label,
                    id: path.join("."),
                    cell: info => {
                        const value = info.getValue();
                        const date = new Date(value);
                        const isValidDate = !isNaN(date.getTime());

                        if (isValidDate) {
                            const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                            const day = date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
                            return `${time} ${day}`;
                        }
                        return value;
                    }
                });
            } else {
                return columnHelper.accessor(key, {
                    header: label,
                    cell: info => {
                        const value = info.getValue();
                        const date = new Date(value);
                        const isValidDate = !isNaN(date.getTime());

                        if (isValidDate) {
                            const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                            const day = date.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
                            return `${time} ${day}`;
                        }
                        return value;
                    }
                });
            }
        }

        const columns = Object.entries(selectTable.columns).flatMap(([key, label]) => {
            if (typeof label === 'object' && label !== null) {
                return Object.entries(label).map(([subKey, subLabel]) => {
                    return createColumnHelper(subKey, subLabel, [key, subKey]);
                });
            } else {
                return createColumnHelper(key, label);
            }
        });
        setColumns(columns);

        setSortingTable(
            Object.keys(selectTable.columns).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {})
        );

        async function loadData(){
            try {
                const res = await fetch(selectTable.url + `?page=${page}`)
                const json = await res.json()
                setMaxPage(json.last_page)
                setData(json.data)
            } catch (error) {
                console.error("Erreur API :", error)
            }
        }
        loadData();
    }, [selectTable]);

    function changeSortingStatus(name) {
        setSortingTable((prev) => {
            const baseValue = prev[name];
            let newValue = 0;
            if (baseValue !== 0) {
                newValue = baseValue === 1 ? 2 : 1;
            } else {
                newValue = 1;
            }
            const newSorting = Object.keys(prev).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {});
            newSorting[name] = newValue;
            const url = (hasFilter ? currentUrl : baseUrl) + `${hasFilter ? '&' : '?'}sort=${name}:${newValue === 1 ? "asc" : "desc"}`;
            setCurrentUrl(url);
            getNewData(url, 1);
            setPage(1)
            return newSorting;
        });
    }

    async function getNewData(url, page) {
        if(url === baseUrl){
            url += `?page=${page}`
        }else{
            url += `&page=${page}`
        }
        try {
            const res = await fetch(url)
            const json = await res.json()
            setMaxPage(json.last_page)
            setData(json.data)
        } catch (error) {
            console.error("Erreur API :", error)
        } 
    }

    function handleFilter({column, operator, value}) {
        let url = baseUrl;
        url +="?filters" + `[${column}][${operator}]=${value}`;
        setCurrentFilter([column, operator, value]);
        setCurrentUrl(url);
        setPage(1);
        setHasFilter(true);
        getNewData(url, 1);
    }

    async function download_csv(url) {
        if(url === baseUrl){
            url += `?all=true`
        }else{
            url += `&all=true`
        }
        const res = await fetch(url)
        const csvData = await res.json()

        let csvHeader = Object.keys(csvData[0]).join(',') + '\n';
        let csvBody = csvData.map(row => Object.values(row).join(',')).join('\n');

        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvHeader + csvBody);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'export.csv';
        hiddenElement.click();
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="p-2">
            <div className="flex">
                <button onClick={() => {setShowModal(true)}} className={"bg-gray-400 rounded-lg p-2 mb-2 cursor-pointer"}>
                    Filtres
                </button>
                <button
                    onClick={() => {
                        download_csv(currentUrl);
                    }}
                    className={"bg-gray-400 rounded-lg p-2 ml-2 mb-2 cursor-pointer"}
                >
                    Exporter
                </button>
                <SelectFilter showModal={showModal} setShowModal={setShowModal} columns={columns} handleFilter={handleFilter} optionsFilter={optionsFilter} selectTable={selectTable} />
                {hasFilter && (
                    <button
                        className="bg-gray-400 rounded-lg px-3 py-2 mb-2 ml-2 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                            setHasFilter(false)
                            getNewData(baseUrl, page)
                        }}
                    >
                      <span>
                        {`${columns.find(c => c.accessorKey === currentFilter[0])?.header} ${
                            optionsFilter[currentFilter[1]]
                        } à ${currentFilter[2]}`}
                      </span>
                        <FiX className="shrink-0" />
                    </button>
                )}
            </div>
            <table className="border-collapse border border-gray-300 w-full">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b">
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="border px-2 py-1 text-left cursor-pointer" onClick={() => changeSortingStatus(header.id)}>
                                    <div className="flex items-center">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {sortingTable[header.id] === 1 ? <BsChevronUp size={15}/> : sortingTable[header.id] === 2 ? <BsChevronDown size={15}/> : <BsChevronExpand size={15}/> }
                                    </div>
                                </th>
                            ))}
                            {link && (
                                <th>{link.name}</th>
                            )}
                        </tr>
                    ))}
                </thead>

                <tbody>
                {table.getRowModel().rows.length === 0 ? (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="text-center p-4 text-gray-500"
                        >
                            Aucun profil trouvé
                        </td>
                    </tr>
                ) : (
                    table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-b">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="border p-2">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}

                            {link && (
                                <td className={"border-2 text-center align-middle"}>
                                    <Link
                                        className="bg-gray-200 cursor-pointer px-3 py-1 rounded-lg"
                                        href={`${link.url}${row.original[link.params]}`}
                                    >
                                        Voir
                                    </Link>
                                </td>
                            )}
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            <div className="flex mt-2 gap-3">
                <button className={`bg-secondary p-2 rounded-lg border-2 border-gray-600 hover:bg-gray-500 ${page > 1 ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => {
                        if(page > 1){
                            getNewData(currentUrl, page - 1)
                            setPage(page - 1)
                        }
                    }}
                >
                    Précédent
                </button>
                <button className={`bg-secondary p-2 rounded-lg border-2 border-gray-600 hover:bg-gray-500 ${page < maxPage ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => {
                        if(page < maxPage){
                            getNewData(currentUrl, page + 1)
                            setPage(page + 1)
                        }
                    }}
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
