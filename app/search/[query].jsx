import { View, Text, SafeAreaView, FlatList } from "react-native";
import { useEffect} from "react";
import { useLocalSearchParams } from "expo-router";

import SearchInput from "../../components/SearchInput";

import EmptyState from "../../components/EmptyState";

import { searchPosts } from "../../lib/appwrite";
import { useAppwrite } from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";

const Search = () => {
  const { query } = useLocalSearchParams();
  const { data: posts, refetch } = useAppwrite(() => searchPosts(query));

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full mt-6">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <>
            <View className="flex my-4 px-4">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  search results
                </Text>
                <Text className="text-2xl font-psemibold text-white mt-1">
                  {query}
                </Text>
                <View className="mt-6 mb-8">
                  <SearchInput initialQuery={query} />
                </View>
              </View>
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subtitle="No videos found for this search query"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Search;
