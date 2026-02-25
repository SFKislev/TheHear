import FlagIcon from "@/components/FlagIcon"
import { countries } from "@/utils/sources/countries"
import { Divider } from "@mui/material"

export default function CountryName({ country, typography, locale}) {

    return (
        <span className="flex items-center gap-2 text-blue cursor-text pt-1 px-1" style={{ 
            ...typography, 
            fontSize: '1.2rem',
            fontFamily: typography.fontFamily 
        }}>
            {locale == 'heb' ? countries[country].hebrew : countries[country].english}
            <Divider orientation="vertical" flexItem />
            <div className="px-1">
                <FlagIcon country={country} />
            </div>
        </span>
    )
}