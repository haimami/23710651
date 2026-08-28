import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useReducer,
  memo,
} from 'react';
import {
  View,
  FlatList,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@components/ui/Typography';
import { ShopInput } from '@components/ui/ShopInput';
import { ShopButton } from '@components/ui/ShopButton';
import {
  STUDENT,
  VARIANT,
  BANNER_IMAGE_ID,
  FLASH_SECONDS,
  examStamp,
} from '@constants/student';
import { SIZES } from '@constants/theme';
import { useTheme } from '@contexts/ThemeContext';
import { useCountdown } from '@hooks/useCountdown';
import {
  fetchProducts,
  Product,
  CategoryId,
} from '@services/productApi';

// Reducer quản lý số lượng đặt món theo yêu cầu Câu 3a
type QuantityAction = { type: 'ADD' } | { type: 'REMOVE' } | { type: 'RESET' };

const quantityReducer = (state: number, action: QuantityAction): number => {
  switch (action.type) {
    case 'ADD':
      return state + 1;
    case 'REMOVE':
      return state > 1 ? state - 1 : 1;
    case 'RESET':
      return 1;
    default:
      return state;
  }
};

const CATEGORY_LABELS: Record<CategoryId, string> = {
  all: 'Tất cả',
  food: 'Đồ ăn',
  drink: 'Nước',
  study: 'Học tập',
};

// Item hiển thị trong danh sách sản phẩm (được memo tối ưu)
interface ProductCardProps {
  item: Product;
  onSelect: (product: Product) => void;
}

const ProductCard = memo<ProductCardProps>(({ item, onSelect }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(item)}
      style={[
        styles.productCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <Typography
          variant="bodyBold"
          color={colors.text}
          numberOfLines={1}
          style={styles.productTitle}
        >
          {item.title}
        </Typography>
        <Typography
          variant="bodyBold"
          color={colors.primary}
          style={styles.productPrice}
        >
          {item.formattedPrice}
        </Typography>
        <Typography
          variant="caption"
          color={colors.textLight}
          style={styles.productCategory}
        >
          {CATEGORY_LABELS[item.category]}
        </Typography>
      </View>
      <ShopButton
        title="Đặt"
        onPress={() => onSelect(item)}
        style={styles.orderButton}
      />
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const countdown = useCountdown(FLASH_SECONDS);

  // State dữ liệu
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State bộ lọc
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [bannerError, setBannerError] = useState<boolean>(false);

  // State Modal đặt món
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [quantity, dispatchQuantity] = useReducer(quantityReducer, 1);

  const stampValue = useMemo(() => examStamp(), []);

  // Gọi API tải sản phẩm có cờ alive (cleanup)
  const loadProducts = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchProducts()
      .then((data) => {
        if (alive) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (alive) {
          setError(err.message || 'Lỗi tải dữ liệu');
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadProducts();
    return cleanup;
  }, [loadProducts]);

  // Thứ tự chip danh mục theo biến thể số cuối MSSV
  const categoriesList = useMemo<CategoryId[]>(() => {
    const defaultList: CategoryId[] = ['all', 'food', 'drink', 'study'];
    if (VARIANT.chipsReversed) {
      // Đảo thứ tự: Học tập -> Nước -> Đồ ăn -> Tất cả
      return ['study', 'drink', 'food', 'all'];
    }
    return defaultList;
  }, []);

  // Lọc sản phẩm theo từ khóa tìm kiếm và danh mục bằng useMemo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchQuery = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleOpenOrderModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    dispatchQuantity({ type: 'RESET' });
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedProduct(null);
    dispatchQuantity({ type: 'RESET' });
  }, []);

  const handleConfirmOrder = useCallback(() => {
    if (!selectedProduct) return;

    Alert.alert(
      `CampusMart · ${STUDENT.mssv}`,
      `${STUDENT.hoTen} (#${stampValue}) đã ghi nhận: ${selectedProduct.title} × ${quantity}. Nhận tại quầy KTX.`,
      [
        {
          text: 'OK',
          onPress: () => {
            handleCloseModal();
          },
        },
      ]
    );
  }, [selectedProduct, quantity, stampValue, handleCloseModal]);

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard item={item} onSelect={handleOpenOrderModal} />
    ),
    [handleOpenOrderModal]
  );

  const keyExtractor = useCallback(
    (item: Product) => `${STUDENT.mssv}-${item.id}`,
    []
  );

  // Thanh định danh Watermark dòng tên
  const renderIdentityBar = (isTop: boolean) => (
    <View
      style={[
        styles.identityContainer,
        isTop ? styles.identityTop : styles.identityBottom,
        {
          backgroundColor: isDark ? '#021C1B' : '#CCFBF1',
          borderColor: colors.border,
        },
      ]}
    >
      <Typography
        variant="caption"
        color={isDark ? '#5EEAD4' : '#0F766E'}
        align="center"
      >
        TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{stampValue}
      </Typography>
    </View>
  );

  // Header chứa (A) Tiêu đề, nút Sáng/Tối, Slogan, Đồng hồ, (B) Ô tìm kiếm, (C) Banner, (D) 4 Chip
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Khối (A): Header Title + Theme Switcher + Slogan + Countdown */}
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <Typography variant="title" color={colors.primary}>
            CAMPUSMART
          </Typography>

          {VARIANT.themeControl === 'switch' ? (
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.themeButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Typography variant="caption" color={colors.text}>
                {isDark ? '🌙 Tối' : '☀️ Sáng'}
              </Typography>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleTheme}
              style={[
                styles.themeButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Typography variant="caption" color={colors.text}>
                {isDark ? 'Sáng / Tối (Tối)' : 'Sáng / Tối (Sáng)'}
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sloganRow}>
          <Typography variant="subtitle" color={colors.textLight}>
            Tiện lợi KTX
          </Typography>
          <Typography variant="bodyBold" color={colors.secondary}>
            {countdown.isExpired
              ? 'Flash Hết giờ'
              : `Flash ${countdown.formatted}`}
          </Typography>
        </View>
      </View>

      {/* Khối (B): ShopInput có placeholder chứa MSSV */}
      <View style={styles.searchBlock}>
        <ShopInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Tìm món, nước, đồ dùng — ${STUDENT.mssv}`}
        />
      </View>

      {/* Khối (C): Banner Picsum */}
      <View style={styles.bannerBlock}>
        <View
          style={[
            styles.bannerContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {!bannerError ? (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.bannerImage}
              resizeMode="cover"
              onError={() => setBannerError(true)}
            />
          ) : (
            <View
              style={[
                styles.bannerFallback,
                { backgroundColor: colors.primary },
              ]}
            />
          )}
          <View style={styles.bannerOverlay}>
            <Typography variant="bodyBold" color="#FFFFFF" align="center">
              Đặt nhanh · Nhận tại quầy
            </Typography>
            <Typography variant="caption" color="#E6FFFA" align="center">
              Cửa hàng tiện lợi ký túc xá 24/7
            </Typography>
          </View>
        </View>
      </View>

      {/* Khối (D): 4 Chip Categories */}
      <View style={styles.categoriesRow}>
        {categoriesList.map((catId) => {
          const isSelected = selectedCategory === catId;
          return (
            <TouchableOpacity
              key={catId}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(catId)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Typography
                variant="caption"
                color={isSelected ? '#FFFFFF' : colors.text}
              >
                {CATEGORY_LABELS[catId]}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Watermark ở trên nếu VARIANT.watermarkAtTop = true */}
      {VARIANT.watermarkAtTop && renderIdentityBar(true)}

      {/* 3 Cảnh mạng */}
      {loading ? (
        // Cảnh 1: Đang tải
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography
            variant="body"
            color={colors.textLight}
            style={styles.loadingText}
          >
            Đang tải món...
          </Typography>
        </View>
      ) : error ? (
        // Cảnh 3: Lỗi mạng
        <View style={styles.centerContainer}>
          <Typography
            variant="bodyBold"
            color={colors.error}
            align="center"
            style={styles.errorText}
          >
            {STUDENT.mssv} — Không tải được dữ liệu món.
          </Typography>
          <ShopButton
            title="Thử lại"
            onPress={loadProducts}
            style={styles.retryButton}
          />
        </View>
      ) : (
        // Cảnh 2: Có dữ liệu (FlatList)
        <FlatList
          data={filteredProducts}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Typography
                variant="body"
                color={colors.textLight}
                align="center"
              >
                Không có món phù hợp
              </Typography>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Watermark ở dưới nếu VARIANT.watermarkAtTop = false */}
      {!VARIANT.watermarkAtTop && renderIdentityBar(false)}

      {/* Giao diện 2: Modal Đặt món (Câu 3a & 3b) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType={VARIANT.modalAnimation}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Dòng tên trong modal */}
            <View style={styles.modalHeaderIdentity}>
              <Typography
                variant="caption"
                color={isDark ? '#5EEAD4' : colors.primary}
                align="center"
              >
                TH1 · {STUDENT.mssv} · {STUDENT.hoTen} · #{stampValue}
              </Typography>
            </View>

            {selectedProduct && (
              <>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <Typography
                  variant="bodyBold"
                  color={colors.text}
                  align="center"
                  style={styles.modalTitle}
                  numberOfLines={2}
                >
                  {selectedProduct.title}
                </Typography>

                <Typography
                  variant="title"
                  color={colors.primary}
                  align="center"
                  style={styles.modalPrice}
                >
                  {selectedProduct.formattedPrice}
                </Typography>

                <Typography
                  variant="caption"
                  color={colors.textLight}
                  align="center"
                  style={styles.modalCategory}
                >
                  Danh mục: {CATEGORY_LABELS[selectedProduct.category]}
                </Typography>

                <Typography
                  variant="body"
                  color={colors.textLight}
                  align="center"
                  numberOfLines={2}
                  style={styles.modalDesc}
                >
                  {selectedProduct.description}
                </Typography>

                {/* Bộ đếm số lượng dùng useReducer */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => dispatchQuantity({ type: 'REMOVE' })}
                    style={[
                      styles.qtyButton,
                      {
                        backgroundColor: isDark ? '#021C1B' : '#E6FFFA',
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Typography variant="bodyBold" color={colors.primary}>
                      −
                    </Typography>
                  </TouchableOpacity>

                  <Typography
                    variant="bodyBold"
                    color={colors.text}
                    style={styles.qtyText}
                  >
                    {quantity}
                  </Typography>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => dispatchQuantity({ type: 'ADD' })}
                    style={[
                      styles.qtyButton,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Typography variant="bodyBold" color="#FFFFFF">
                      +
                    </Typography>
                  </TouchableOpacity>
                </View>

                {/* Thông báo hết giờ flash sale nếu có */}
                {countdown.isExpired && (
                  <Typography
                    variant="caption"
                    color={colors.error}
                    align="center"
                    style={styles.expiredWarning}
                  >
                    Hết giờ flash-sale
                  </Typography>
                )}

                {/* Nút xác nhận đặt món */}
                <ShopButton
                  title="Xác nhận đặt"
                  onPress={handleConfirmOrder}
                  disabled={countdown.isExpired}
                  style={styles.confirmButton}
                />

                {/* Nút đóng */}
                <ShopButton
                  title="Đóng"
                  variant="outline"
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  identityContainer: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityTop: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  identityBottom: {
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  listContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  listHeaderContainer: {
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
  },
  headerBlock: {
    marginBottom: SIZES.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xs,
  },
  themeButton: {
    borderWidth: 1,
    borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.xs + 2,
    paddingHorizontal: SIZES.sm + 4,
  },
  sloganRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBlock: {
    marginBottom: SIZES.md,
  },
  bannerBlock: {
    marginBottom: SIZES.md,
  },
  bannerContainer: {
    height: 120,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerFallback: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 118, 110, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  chip: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 3,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    marginBottom: SIZES.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
    marginHorizontal: SIZES.md,
  },
  productTitle: {
    marginBottom: 2,
  },
  productPrice: {
    marginBottom: 2,
  },
  productCategory: {
    textTransform: 'capitalize',
  },
  orderButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xxl,
  },
  loadingText: {
    marginTop: SIZES.md,
  },
  errorText: {
    marginBottom: SIZES.lg,
  },
  retryButton: {
    minWidth: 140,
  },
  emptyContainer: {
    padding: SIZES.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    padding: SIZES.xl,
    alignItems: 'center',
  },
  modalHeaderIdentity: {
    marginBottom: SIZES.md,
  },
  modalImage: {
    width: 110,
    height: 110,
    borderRadius: SIZES.radiusMd,
    backgroundColor: '#FFFFFF',
    marginBottom: SIZES.md,
  },
  modalTitle: {
    marginBottom: SIZES.xs,
  },
  modalPrice: {
    marginBottom: SIZES.xs,
  },
  modalCategory: {
    marginBottom: SIZES.xs,
  },
  modalDesc: {
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
  },
  qtyButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    marginHorizontal: SIZES.xl,
  },
  expiredWarning: {
    marginBottom: SIZES.sm,
  },
  confirmButton: {
    width: '100%',
    marginBottom: SIZES.sm,
  },
  closeButton: {
    width: '100%',
  },
});