import * as ct from "countries-and-timezones";

export function getCountryFromTImezone(timezone?: string) {
  if (!timezone) {
    return null;
  }

  const tiemzoneInfo = ct.getTimezone(timezone);
  if (!tiemzoneInfo?.countries?.length) {
    return null;
  }

  const countryCode = tiemzoneInfo.countries[0];
  const country = ct.getCountry(countryCode as string);

  return {
    code: countryCode,
    name: country?.name || countryCode,
  };
}

export function getCountryFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}
