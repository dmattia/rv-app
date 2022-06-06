import { Input, Card, Loading } from "@nextui-org/react";
import { MdPlace } from "react-icons/md";
import { useState, useEffect } from "react";
import { useSearchLocationLazyQuery } from "@rv-app/generated-schema";

export function LocationAutocomplete() {
  const [searchText, setSearchText] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const [searchLocation, { data, loading, error }] =
    useSearchLocationLazyQuery();

  useEffect(() => {
    if (searchText) {
      searchLocation({ variables: { query: searchText } });
    }
  }, [searchText]);

  console.log(selectedAddress);

  return (
    <>
      <Input
        clearable
        bordered
        fullWidth
        color="primary"
        size="lg"
        label="Location"
        placeholder="location"
        contentLeft={<MdPlace />}
        onChange={(e) => setSearchText(e.target.value)}
      />
      {loading && <Loading />}
      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error.message}
        </p>
      )}
      {data?.searchLocation && (
        <Card clickable shadow={false}>
          {data?.searchLocation.map(({ address }, index) => (
            <>
              <p
                className="p-2 text-sm"
                onClick={() => setSelectedAddress(address)}
              >
                {address}
              </p>
              {index != data?.searchLocation.length - 1 && (
                <hr className="h-0.5 bg-gray-300" />
              )}
            </>
          ))}
        </Card>
      )}
    </>
  );
}
