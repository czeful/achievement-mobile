import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function FriendRequestsScreen({ navigation }) {
  const requests = [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      avatar: 'https://via.placeholder.com/50',
      mutualFriends: 8
    },
    { 
      id: '2', 
      name: 'Tom Wilson', 
      avatar: 'https://via.placeholder.com/50',
      mutualFriends: 3
    },
  ];

  const renderRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <Image
        style={styles.avatar}
        source={{ uri: item.avatar }}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.declineButton]}>
          <Text style={[styles.actionButtonText, styles.declineButtonText]}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friend Requests</Text>
        <Text style={styles.requestCount}>{requests.length} requests</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friend requests</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  requestCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  list: {
    flex: 1,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  mutualFriends: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 