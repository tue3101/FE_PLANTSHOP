// Dữ liệu thành phố và quận/huyện cố định
export const CITIES = [
  {
    id: 1,
    name: "Hồ Chí Minh",
  },
  {
    id: 2,
    name: "Bà Rịa - Vũng Tàu",
  },
]

export const DISTRICTS_BY_CITY = {
  1: [
    // Hồ Chí Minh
    { id: 1, name: "Quận 1" },
    { id: 3, name: "Quận 3" },
    { id: 4, name: "Quận 4" },
    { id: 5, name: "Quận 5" },
    { id: 6, name: "Quận 6" },
    { id: 7, name: "Quận 7" },
    { id: 8, name: "Quận 8" },
    { id: 10, name: "Quận 10" },
    { id: 11, name: "Quận 11" },
    { id: 12, name: "Quận 12" },
    { id: 13, name: "Quận Bình Tân" },
    { id: 14, name: "Quận Bình Thạnh" },
    { id: 15, name: "Quận Gò Vấp" },
    { id: 16, name: "Quận Phú Nhuận" },
    { id: 17, name: "Quận Tân Bình" },
    { id: 18, name: "Quận Tân Phú" },
    { id: 19, name: "Quận Thủ Đức" },
  ],
  2: [
    // Bà Rịa - Vũng Tàu
    { id: 20, name: "Vũng Tàu" },
    { id: 21, name: "Bà Rịa" },
    { id: 22, name: "Phú Mỹ" },
    { id: 23, name: "Châu Đức" },
    { id: 24, name: "Côn Đảo" },
    { id: 25, name: "Đất Đỏ" },
    { id: 26, name: "Long Điền" },
    { id: 27, name: "Tân Thành" },
    { id: 28, name: "Xuyên Mộc" },
  ],
}

// Helper functions
export const getCityById = (cityId) => {
  return CITIES.find((city) => city.id === cityId) || null
}

export const getDistrictsByCityId = (cityId) => {
  return DISTRICTS_BY_CITY[cityId] || []
}

export const getDistrictById = (districtId) => {
  for (const districts of Object.values(DISTRICTS_BY_CITY)) {
    const district = districts.find((d) => d.id === districtId)
    if (district) return district
  }
  return null
}
