

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation:10
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  imageOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeText: {
    fontSize: 16,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    maxWidth: '80%',
  },
  userEmail: {
    fontSize: 16,
    maxWidth: '80%',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;