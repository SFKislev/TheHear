import { countryToAlpha2 } from "country-to-iso";

const getFlagUrl = (country, size = '16x12') => {
    const isoCountry = countryToAlpha2(country);
    if (!isoCountry) return '';
    return `https://flagcdn.com/${size}/${isoCountry.toLowerCase()}.png`;
};

export default function FlagIcon({ country, size = '16x12', width = 16, height = 12, className = '', style = {} }) {
    const flagUrl = getFlagUrl(country, size);
    return (
        <img
            src={flagUrl}
            alt={`Flag of ${country}`}
            width={width}
            height={height}
            className={className}
            style={{
                width: `${width / 16}rem`,
                height: `${height / 16}rem`,
                verticalAlign: 'middle',
                ...style,
            }}
        />
    )
}
