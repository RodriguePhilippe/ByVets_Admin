"use client"

import React from "react"
import { FiUser } from "react-icons/fi";
import { LuBuilding } from "react-icons/lu";
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function SearchBar(){
    const wrapperRef = React.useRef(null);
    const [search, setSearch] = React.useState('')
    const [cursor, setCursor] = React.useState(0)
    const [dataProfiles, setDataProfiles] = React.useState([]);
    const companyData = ["organization_name", "tva_number"];
    const userData = ["user_name"];
    const [showModal, setShowModal] = React.useState("hidden")
    const inputRef = React.useRef(null);
    const router = useRouter();
    const comparaison = {
        "organization_name": "Cabinet",
        "phone": "Numéro de téléphone",
        "omv": "Omv",
        "lastname": "Nom",
        "firstname": "Prénom",
        "tva_number": "Numéro de TVA",
        "email": "Mail",
        "user_name": "Nom"
    }

    React.useEffect(() => {
        async function loadData(){
            try {
                const res = await fetch(`http://localhost:8000/api/rodrigue/profile/${encodeURIComponent(search)}`)
                const json = await res.json()
                let data = [];
                if(!json.error) {
                    data = json.profiles
                    for (const user of json.users) {
                        data.push(user)
                    }
                }
                setDataProfiles(data)
            } catch (error) {
                console.error("Erreur API :", error)
            }
        }
        if(search.trim().length > 1){
            loadData();
        }else(
            setDataProfiles([])
        )
    }, [search])

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowModal("hidden")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    React.useEffect(() => {
        function handleShortcut(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setShowModal("block");
            }
        }

        document.addEventListener("keydown", handleShortcut);

        return () => {
            document.removeEventListener("keydown", handleShortcut);
        };
    }, []);

    function handleKeyDown (e) {
        if (!dataProfiles) return
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newCursor = Math.min(cursor + 1, dataProfiles.length - 1);
            setCursor(newCursor);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newCursor = Math.max(0, cursor - 1);
            setCursor(newCursor);
        } else if (e.key === "Enter") {
            const organisationId = dataProfiles[cursor].organization_id
            router.push('/organization/' + organisationId);
        } else if (e.key === "Escape") {
            setShowModal("hidden");
            setCursor(0);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={wrapperRef} className="m-5">
            <div className="flex gap-4">
                <label>Recherche</label>
                <input
                    ref={inputRef}
                    className="border-gray-500 border-2 rounded-lg "
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onSelect={(e) => setShowModal("block")}
                    onKeyDown={(e) => handleKeyDown(e)}
                />
            </div>

            <div className={`absolute top-15 z-10 ${showModal} bg-white border-2 border-gray-700 rounded-lg`}>
                {dataProfiles && dataProfiles.length > 0 ? (
                    (() => {
                        const filteredProfiles = dataProfiles.filter(p => p.matched_column);

                        if (filteredProfiles.length === 0) {
                            return (
                                <div className="hover:bg-gray-200 cursor-pointer rounded-lg p-2">
                                    <p>Aucun utilisateur trouvé</p>
                                </div>
                            )
                        }
                        return filteredProfiles.map((profile, key) => {
                            const isCompany = companyData.includes(profile.matched_column);
                            const isUser = userData.includes(profile.matched_column);
                            return (
                                <div key={key} className={`hover:bg-gray-200 ${cursor === key && 'bg-gray-200'} cursor-pointer ${key === 0 && 'rounded-t-lg'} ${key === filteredProfiles.length - 1 && 'rounded-b-lg'}`}>
                                    <div className="flex">
                                        <div className="items-center content-center m-3">
                                            {isCompany ? <LuBuilding size={30}/> : <FiUser size={30}/>}
                                        </div>
                                            <Link className="rounded-lg p-2" href={`/organization/${profile.organization_id}`}>
                                                {isCompany ? (
                                                    <p>{profile.organization_name ? profile.organization_name : "Vétérinaire " + profile.firstname + ' ' + profile.lastname}</p>
                                                ) : isUser ? (
                                                    <p>{profile.user_name}</p>
                                                ) : profile.firstname && profile.lastname ? (
                                                    <p>{profile.firstname} {profile.lastname}</p>
                                                ) : (
                                                    <p>{profile.user_name}</p>
                                                )}
                                                <p>{comparaison[profile.matched_column]} : {getMatchedText(search, profile[profile.matched_column])}</p>
                                            </Link>
                                    </div>
                                    {key < filteredProfiles.length - 1 && (
                                        <div className= "bg-black h-0.5 w-full"></div>
                                    )}
                                </div>
                            )
                        })
                    })
                )() : (
                    <div className="hover:bg-gray-200 cursor-pointer rounded-lg p-2">
                        <p>Aucun utilisateur trouvé</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function getMatchedText(searchText, baseText) {
  if (!searchText || !baseText) return baseText;

  const regex = new RegExp(`(${searchText})`, "gi");
  const parts = baseText.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === searchText.toLowerCase() ? (
      <span key={index} className="bg-gray-400">
        {part}
      </span>
    ) : (
      part
    )
  );
}
