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
import SelectColumn from "./SelectColumn";

const columnHelper = createColumnHelper();

export default function FilterTable({selectTable, type}) {
    const [mounted, setMounted] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [baseUrl, setBaseUrl] = React.useState(selectTable.url);
    const [currentUrl, setCurrentUrl] = React.useState(baseUrl);
    const [link, setLink] = React.useState([]);
    const [pagination, setPagination] = React.useState(20);
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
                const res = await fetch(selectTable.url + `?page=${page}&pagination=${pagination}`);
                const json = await res.json()
                setMaxPage(json.last_page)
                setData(json.data)
            } catch (error) {
                console.error("Erreur API :", error)
            }
        }
        loadData();
    }, [selectTable]);

    const storageKey = `columnVisibility_${type}`;
    const [columnVisibility, setColumnVisibility] = React.useState();

    React.useEffect(() => {
        if (typeof window === "undefined") return {};

        const visibility = Object.fromEntries(
            columns.map(col => [col.id ?? col.accessorKey, true])
        );

        if (localStorage.getItem(storageKey) !== "undefined") {
            const oldSelectedColumns = JSON.parse(localStorage.getItem(storageKey));
            if (oldSelectedColumns && Object.keys(oldSelectedColumns).join() === Object.keys(visibility).join()) {
                return setColumnVisibility(oldSelectedColumns);
            }
        }

        setColumnVisibility(visibility);
    }, [columns]);

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

    React.useEffect(() => {
        getNewData(baseUrl, page);
    }, [pagination]);

    async function getNewData(url, page) {
        if(url === baseUrl){
            url += `?page=${page}`
        }else{
            url += `&page=${page}`
        }
        url += `&pagination=${pagination}`
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
            url += `?pagination=all`
        }else{
            url += `&pagination=all`
        }

        const res = await fetch(url)
        const csvData = await res.json()

        let csvHeader = Object.keys(csvData.data[0]).join(',') + '\n';
        let csvBody = csvData.data.map(row => Object.values(row).join(',')).join('\n');

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
        state: {
            columnVisibility
        }
    });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const visibleCount = table.getVisibleLeafColumns().length + (link ? 1 : 0);
    const gridTemplate = `repeat(${visibleCount}, minmax(0, 1fr))`;

    return (
        <div className="p-2">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={() => {setShowModal(true)}} className={"bg-gray-400 rounded-lg p-2 cursor-pointer"}>
                    Filtres
                </button>
                <button
                    onClick={() => {
                        download_csv(currentUrl);
                    }}
                    className={"bg-gray-400 rounded-lg p-2 cursor-pointer"}
                >
                    Exporter
                </button>
                <SelectFilter showModal={showModal} setShowModal={setShowModal} columns={columns} handleFilter={handleFilter} optionsFilter={optionsFilter} selectTable={selectTable} />
                {hasFilter && (
                    <button
                        className="bg-gray-400 rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2"
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
                <SelectColumn columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} selectedTable={selectTable} storageKey={storageKey} />
                <div>
                    Pagination
                    <select
                        onChange={(e) => {
                            setPagination(e.target.value);
                        }}
                        value={pagination}
                        className="ml-2"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={"all"}>Tous</option>
                    </select>
                </div>
            </div>

            <div className="border border-gray-300 w-full rounded-lg overflow-hidden">
                {table.getHeaderGroups().map(headerGroup => (
                    <div
                        key={headerGroup.id}
                        className="border-b bg-gray-100"
                        style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
                    >
                        {headerGroup.headers.map(header => (
                            <div
                                key={header.id}
                                className="p-2 text-left cursor-pointer flex items-start gap-1 border-r last:border-r-0 min-w-0"
                                onClick={() => changeSortingStatus(header.id)}
                            >
                                <span className="break-words min-w-0">
                                    {!header.isPlaceholder && flexRender(header.column.columnDef.header, header.getContext())}
                                </span>
                                {sortingTable[header.id] === 1 ? (
                                    <BsChevronUp size={15} className="shrink-0 mt-0.5" />
                                ) : sortingTable[header.id] === 2 ? (
                                    <BsChevronDown size={15} className="shrink-0 mt-0.5" />
                                ) : (
                                    <BsChevronExpand size={15} className="shrink-0 mt-0.5" />
                                )}
                            </div>
                        ))}
                        {link && (
                            <div className="p-2 border-r last:border-r-0 text-center">{link.name}</div>
                        )}
                    </div>
                ))}

                {table.getRowModel().rows.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Aucun profil trouvé</div>
                ) : (
                    table.getRowModel().rows.map(row => (
                        <div
                            key={row.id}
                            className="border-b hover:bg-gray-50"
                            style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
                        >
                            {row.getVisibleCells().map(cell => (
                                <div key={cell.id} className="p-2 border-r last:border-r-0 break-words min-w-0">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            ))}
                            {link && (
                                <div className="p-2 border-r last:border-r-0 text-center">
                                    <Link
                                        className="bg-gray-200 cursor-pointer px-3 py-1 rounded-lg"
                                        href={`${link.url}${row.original[link.params]}`}
                                    >
                                        Voir
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

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
