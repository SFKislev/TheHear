import { countryToAlpha2 } from "country-to-iso";

const getFlagUrl = (country, size = '16x12') => {
    const isoCountry = countryToAlpha2(country).toLowerCase();
    if (!isoCountry) return '';
    return `https://flagcdn.com/${size}/${isoCountry}.png`;
};

export default function FlagIcon({ country }) {
    const flagUrl = getFlagUrl(country);
    return (
        <img
            src={flagUrl}
            alt={`Flag of ${country}`}
            width={16}
            height={12}
            style={{
                width: '1rem',
                height: '0.75rem',
                verticalAlign: 'middle',
                cursor: 'pointer'
            }}
        />
    )
}