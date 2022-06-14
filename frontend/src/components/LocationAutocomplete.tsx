import { Input, Card, Loading } from "@nextui-org/react";
import { MdPlace } from "react-icons/md";
import { useState, useEffect } from "react";
import {
  useSearchLocationLazyQuery,
  useGetLocationDataForAddressLazyQuery,
  LocationInformation,
} from "@rv-app/generated-schema";
import { useIsMount, useDebounce } from "@rv-app/frontend/src/hooks";
import { getEntries } from "@transcend-io/type-utils";

interface LocationAutocompleteProps {
  onLocationSelected?: (info: LocationInformation) => void;
}

export function LocationAutocomplete(props: LocationAutocompleteProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const isMount = useIsMount();
  const [searchLocation, { data, loading, error }] =
    useSearchLocationLazyQuery();
  const [
    searchAddress,
    { data: searchAddressData, loading: searchAddressLoading },
  ] = useGetLocationDataForAddressLazyQuery();

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    if (debouncedSearchText) {
      searchLocation({ variables: { query: debouncedSearchText } });
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    if (!isMount) {
      setSearchText("");
      searchAddress({ variables: { query: selectedAddress } });
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (searchAddressData && props.onLocationSelected) {
      const nonNullFields = Object.fromEntries(
        getEntries(searchAddressData.getLocationDataForAddress).filter(
          ([_, val]) => val != null
        )
      );
      props.onLocationSelected(nonNullFields);
    }
  }, [searchAddressData]);

  const disableInput = !!searchAddressData?.getLocationDataForAddress?.address;
  return (
    <>
      {searchAddressLoading ? (
        <Loading />
      ) : (
        <Input
          clearable={!disableInput}
          bordered
          fullWidth
          color="primary"
          size="lg"
          label="Location"
          placeholder="location"
          value={
            searchAddressData?.getLocationDataForAddress?.address ?? searchText
          }
          disabled={disableInput}
          contentLeft={<MdPlace />}
          onChange={(e) => setSearchText(e.target.value)}
        />
      )}
      {loading && <Loading />}
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error.message}
        </p>
      )}
      {searchText && data?.searchLocation && (
        <Card clickable shadow={false}>
          {data?.searchLocation.map(({ address }, index) => (
            <div key={index}>
              <p
                className="p-2 text-sm"
                onClick={() => setSelectedAddress(address)}
              >
                {address}
              </p>
              {index != data?.searchLocation.length - 1 && (
                <hr className="h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
