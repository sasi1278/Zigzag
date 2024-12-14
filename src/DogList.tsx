import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import BottomSheet from "./Components/BottomSheet";

interface Dog {
  id: number;
  name: string;
  breed_group?: string;
  reference_image_id?: string;
  bred_for?: string;
  life_span?: string;
  weight?: { imperial: string; metric: string };
  height?: { imperial: string; metric: string };
  temperament?: string;
  country_code?: string;
}

const DogList = () => {
  const [data, setData] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [sortAttribute, setSortAttribute] = useState<"height" | "weight" | null>(null);

  const API_URL = "https://api.thedogapi.com/v1/breeds";

  

  const fetchData = async (pageNumber: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?limit=10&page=${pageNumber}`);
      const result: Dog[] = await response.json();
      if (result.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData) => [...prevData, ...result]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const loadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePress = (dog: Dog) => {
    setSelectedDog(dog);
    setBottomSheetVisible(true);
  };

  const handleSort = (attribute: "height" | "weight" | null, order: "asc" | "desc") => {
  
    const sortedData = [...data].sort((a, b) => {
      const aValue = attribute === "height" ? parseFloat(a.height?.imperial || "0") : parseFloat(a.weight?.imperial || "0");
      const bValue = attribute === "height" ? parseFloat(b.height?.imperial || "0") : parseFloat(b.weight?.imperial || "0");
  
      if (order === "asc") return aValue - bValue;
      if (order === "desc") return bValue - aValue;
      return 0;
    });
    setData(sortedData);
  };
  

  const renderItem = ({ item }: { item: Dog }) => {
    const imageUrl = item.reference_image_id
      ? `https://cdn2.thedogapi.com/images/${item.reference_image_id}.jpg`
      : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.breedGroup}>{item.breed_group || "N/A"}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#0000ff" />;
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filteredData = data.filter(
      (dog) => dog.name.toLowerCase().includes(text.toLowerCase()) || (dog.breed_group?.toLowerCase().includes(text.toLowerCase()))
    );
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortOrder(null);
    fetchData(1);
    setData([])
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search by breed or name"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={styles.sortText}>Sort by:</Text>
            <TouchableOpacity onPress={()=>{setSortAttribute('height')}}>
                <Text
                style={[styles.sortOption, sortAttribute === "height" ? styles.activeSort : null]}
                >
                Height
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{setSortAttribute('weight')}}>
                <Text
                style={[styles.sortOption, sortAttribute === "weight" ? styles.activeSort : null]}
                >
                Weight
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleSort(sortAttribute,'asc')}
                style={styles.sortOption}
                >
                <Text style={{ color:sortOrder === "asc" ? "blue" : "black" }}>
                    ↑
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleSort(sortAttribute,'desc')}
                style={styles.sortOption}
                >
                <Text style={{ color:sortOrder === "desc" ? "blue" : "black" }}>
                    ↓
                </Text>
            </TouchableOpacity>

        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
      >
        {selectedDog && (
          <View style={styles.bottomSheetContent}>
            {selectedDog.reference_image_id && (
              <Image
                source={{
                  uri: `https://cdn2.thedogapi.com/images/${selectedDog.reference_image_id}.jpg`,
                }}
                style={styles.bottomSheetImage}
              />
            )}
            <Text style={styles.bottomSheetName}>{selectedDog.name}</Text>
            <View style={styles.row}>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Breed Group: {selectedDog.breed_group || "N/A"}
                </Text>
              </View>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Bred For: {selectedDog.bred_for || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Life Span: {selectedDog.life_span || "N/A"}
                </Text>
              </View>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Weight: {selectedDog.weight ? `${selectedDog.weight.imperial} (Imperial)` : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Height: {selectedDog.height ? `${selectedDog.height.imperial} (Imperial)` : "N/A"}
                </Text>
              </View>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Temperament: {selectedDog.temperament || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.itemBox}>
                <Text style={styles.bottomSheetDetail}>
                  Country Code: {selectedDog.country_code || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  breedGroup: {
    fontSize: 14,
    color: "#666",
  },
  bottomSheetContent: {
    alignItems: "center",
    padding: 16,
  },
  bottomSheetImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  bottomSheetName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
    width: "100%",
  },
  itemBox: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 10,
    width: "48%",
    marginBottom: 8,
  },
  bottomSheetDetail: {
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    padding: 10,
    justifyContent:'center',
    alignItems:'center'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: "95%",
  },
  resetButton: {
    marginLeft: 10,
  },
  resetText: {
    fontSize: 16,
    color: "blue",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    alignItems: "center",
  },
  sortText: {
    fontSize: 16,
  },
  sortOption: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  activeSort: {
    fontWeight: "bold",
    color:'blue'
  },
});

export default DogList;
