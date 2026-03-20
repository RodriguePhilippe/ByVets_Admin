"use client"

import SearchBar from '@/components/SearchBar'
import FilterTable from '@/components/table/FilterTable'
import React from "react"

export default function Home() {
    const selectTable = {
        profiles: {
            url: "http://localhost:8000/api/rodrigue/profiles",
            columns: {
                firstname: "Prénom",
                lastname: "Nom de famille",
                omv: "Omv",
                email: "Email",
                phone: "Numéro de téléphone"
            }
        },
        organizations: {
            url: "http://localhost:8000/api/rodrigue/organizations",
            columns: {
                name: "Nom",
                tva_number: "Numéro de TVA",
                address: "Adresse",
                created_at: "Date de création",
            },
            date: {
                created_at: true
            },
            link: {
                name: "Organisation",
                url: '/organization/',
                params: "id",
            }
        },
        users: {
            url: "http://localhost:8000/api/rodrigue/users",
            columns: {
                name: "Nom",
                email: "Email",
                created_at: "Date de création",
                profile: {
                    omv: "Omv",
                    address: "Adresse",
                }
            },
            date: {
                created_at: true
            }
        }
    };
    const [currentSelectedTable, setCurrentSelectedTable] = React.useState('profiles');

    return (
        <>
            <SearchBar/>
                <select onChange={(e) => {
                    setCurrentSelectedTable(e.target.value)
                }}>
                    <option value={"profiles"}>Profils</option>
                    <option value={"organizations"}>Organisations</option>
                    <option value={"users"}>Utilisateurs</option>
                </select>
            <FilterTable selectTable={selectTable[currentSelectedTable]} type={currentSelectedTable} />
        </>
  );
}
