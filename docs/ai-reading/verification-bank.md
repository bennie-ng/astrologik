# Verification Statement Bank — design & starter content

Status: Draft for review · Date: 2026-07-22
Related: [ADR-0006](./adr/0006-templated-verification-no-llm-prepay.md),
[FR-4](./FR.md), [prompt-design.md](./prompt-design.md)

The pre-payment questionnaire (FR-4) is produced **deterministically from
the chart with no LLM call**. This doc specifies how features are extracted
from a `lunar-core` `TuViChart`, the statement bank keyed to those
features, the selection algorithm, and how answers calibrate the paid
reading.

Goal: 5–8 statements that (a) feel specific to *this* chart, (b) are
answerable by a layperson as **Đúng / Đúng một phần / Không đúng**, and
(c) cover a spread of life areas so the confirmations meaningfully steer
the reading.

---

## 1. Feature extraction

From the `TuViChart` we derive a flat list of **feature keys**. Highest
signal first:

| Source | Feature key(s) | Notes |
| --- | --- | --- |
| Mệnh palace chính tinh | `menh.chinh.<Star>` | The dominant personality driver. `vô chính diệu` if none. |
| …with độ sáng | `menh.chinh.<Star>.<M\|V\|Đ\|B\|H>` | Miếu/Vượng → positive framing; Hãm → challenged framing. |
| Tứ hóa on a Mệnh star | `menh.hoa.<Loc\|Quyen\|Khoa\|Ky>` | Strong modifier of temperament. |
| Notable phụ tinh in Mệnh | `menh.phu.<Star>` | Xương/Khúc, Tả/Hữu, Khôi/Việt, Kình/Đà, Hỏa/Linh, Không/Kiếp, Đào/Hồng. |
| Thân palace role | `than.in.<Cung>` | Where life energy concentrates with age. |
| Cách cục / patterns | `pattern.<name>` | Sát-Phá-Tham, Cơ-Nguyệt-Đồng-Lương, Tử-Phủ, Nhật-Nguyệt. |
| Phu Thê headline | `phuThe.<trait>` | Relationship tendency (from that palace's stars). |
| Tài Bạch headline | `taiBach.<trait>` | Money tendency. |
| Phúc Đức headline | `phucDuc.<trait>` | Inner life / disposition. |

Pattern detection (examples):
- `pattern.SatPhaTham` — Thất Sát, Phá Quân, Tham Lang occupy the
  Mệnh–Quan–Tài triangle.
- `pattern.CoNguyetDongLuong` — Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương
  dominate that triangle.
- `pattern.TuPhu` — Tử Vi and Thiên Phủ anchor Mệnh/Thân area.

Each feature also carries a **category** (for diversity) and a **weight**
(salience). Categories: `tinhCach` (temperament), `tuDuy` (thinking),
`camXuc` (emotional), `quanHe` (relationships), `suNghiep` (career),
`tienBac` (money), `noiTam` (inner life).

---

## 2. Statement bank (starter set)

Each entry: `{ id, when (feature predicate), category, weight, text }`.
Text is the statement the user confirms. This is a **starter** to be
reviewed/expanded with a tử vi domain expert.

### 2.1 Mệnh chính tinh (weight 100 — always a candidate)

| id | when | text (VN) |
| --- | --- | --- |
| `menh-tuvi` | `menh.chinh.TuVi` | Bạn có phong thái điềm đạm, thích được tôn trọng và thường được xem là người có uy, có thể đứng ra quyết định hoặc dẫn dắt. |
| `menh-thiencg` | `menh.chinh.ThienCo` | Bạn nhanh trí, hay suy nghĩ và cân nhắc nhiều phương án; đôi khi nghĩ nhiều quá nên khó dứt khoát. |
| `menh-thaiduong-sang` | `menh.chinh.ThaiDuong` (M/V/Đ) | Bạn cởi mở, nhiệt tình, thích giúp người và khá quan tâm đến thể diện, danh tiếng. |
| `menh-thaiduong-ham` | `menh.chinh.ThaiDuong` (H) | Bạn nhiệt tình lo cho người khác, nhưng nhiều lúc thấy mệt mỏi vì gánh vác hơi nhiều. |
| `menh-vukhuc` | `menh.chinh.VuKhuc` | Bạn thực tế, quyết đoán, giỏi xoay xở tiền bạc; tính thẳng, nói ít làm nhiều, không thích vòng vo. |
| `menh-thiendong` | `menh.chinh.ThienDong` | Bạn hiền hòa, dễ gần, sống thiên về tình cảm và thích sự an nhàn; đôi khi thiếu quyết liệt. |
| `menh-liemtrinh` | `menh.chinh.LiemTrinh` | Bạn có nguyên tắc riêng rõ ràng, nội tâm mạnh và phức tạp; đã quyết là làm tới, nhưng tâm trạng dễ thay đổi. |
| `menh-thienphu` | `menh.chinh.ThienPhu` | Bạn thận trọng, coi trọng ổn định và an toàn; biết vun vén và thường là chỗ dựa đáng tin cho người khác. |
| `menh-thaiam-sang` | `menh.chinh.ThaiAm` (M/V/Đ) | Bạn dịu dàng, tinh tế, giàu cảm xúc và có gu thẩm mỹ; thiên về nội tâm. |
| `menh-thaiam-ham` | `menh.chinh.ThaiAm` (H) | Bạn nhạy cảm, sống nội tâm, nhưng hay suy tư, đôi khi buồn vu vơ hoặc lo nghĩ nhiều. |
| `menh-thamlang` | `menh.chinh.ThamLang` | Bạn quảng giao, có sức hút, nhiều sở thích và tham vọng; thích trải nghiệm và hưởng thụ cuộc sống. |
| `menh-cumon` | `menh.chinh.CuMon` | Bạn giỏi ăn nói, lý luận sắc bén và hay hoài nghi, thích tìm hiểu tận gốc; đôi khi dễ vướng thị phi vì lời nói. |
| `menh-thientuong` | `menh.chinh.ThienTuong` | Bạn trọng lễ nghĩa, công bằng, thích giúp người và để ý tác phong, hình thức; đáng tin cậy. |
| `menh-thienluong` | `menh.chinh.ThienLuong` | Bạn chững chạc, có nguyên tắc và lòng trắc ẩn, hay đứng ra lo liệu, khuyên bảo; có nét "ông/bà cụ non". |
| `menh-thatsat` | `menh.chinh.ThatSat` | Bạn mạnh mẽ, độc lập, dám nghĩ dám làm; nóng ruột, thích tự xông pha hơn là chờ đợi. |
| `menh-phaquan` | `menh.chinh.PhaQuan` | Bạn thích đổi mới, không ưa khuôn phép, sẵn sàng phá cái cũ để làm lại; cuộc sống nhiều thay đổi, thăng trầm. |
| `menh-vcd` | `menh.chinh.none` | Bạn dễ thích nghi, chịu ảnh hưởng nhiều từ môi trường và người xung quanh; tính cách linh hoạt, mỗi giai đoạn một khác. |

### 2.2 Tứ hóa on Mệnh (weight 80)

| id | when | text (VN) |
| --- | --- | --- |
| `menh-hoaky` | `menh.hoa.Ky` | Bạn hay lo nghĩ, cầu toàn, dễ vướng bận tâm trí vào một chuyện và khó buông. |
| `menh-hoaquyen` | `menh.hoa.Quyen` | Bạn thích chủ động nắm quyền, có uy và không thích bị sai khiến. |
| `menh-hoaloc` | `menh.hoa.Loc` | Bạn có duyên với tiền bạc và quan hệ, xoay xở linh hoạt, dễ được lòng người. |
| `menh-hoakhoa` | `menh.hoa.Khoa` | Bạn coi trọng danh tiếng và tri thức; hay được tiếng tốt, hợp học hành, thi cử. |

### 2.3 Notable phụ tinh in Mệnh (weight 70)

| id | when | text (VN) |
| --- | --- | --- |
| `menh-xuongkhuc` | `menh.phu.VanXuong` or `VanKhuc` | Bạn ưa học hỏi, có khiếu nói hoặc viết, thích cái đẹp và sự tinh tế. |
| `menh-tahuu` | `menh.phu.TaPhu` or `HuuBat` | Bạn thường có quý nhân, bạn bè hoặc người thân giúp đúng lúc; hợp làm việc nhóm hơn đơn độc. |
| `menh-khoiviet` | `menh.phu.ThienKhoi` or `ThienViet` | Bạn hay gặp may hoặc được người có vai vế nâng đỡ vào lúc quan trọng. |
| `menh-kinhda` | `menh.phu.KinhDuong` or `DaLa` | Bạn cá tính mạnh, đôi khi nóng nảy hoặc vất vả hơn người khác để đạt điều mình muốn. |
| `menh-hoalinh` | `menh.phu.HoaTinh` or `LinhTinh` | Bạn tính nóng, phản ứng nhanh, dễ bốc đồng nhưng cũng dứt khoát. |
| `menh-khongkiep` | `menh.phu.DiaKhong` or `DiaKiep` | Bạn suy nghĩ khác số đông, ít theo lối mòn; tiền bạc dễ đến dễ đi, hợp hướng độc lập/sáng tạo. |
| `menh-daohong` | `menh.phu.DaoHoa` or `HongLoan` | Bạn có duyên ăn nói, dễ mến, được người khác giới quý mến. |

### 2.4 Thân palace (weight 60)

| id | when | text (VN) |
| --- | --- | --- |
| `than-menh` | `than.in.Menh` | Bạn khá "chủ quan" về đường đời — sống theo cá tính của mình và tự định đoạt là chính. |
| `than-quan` | `than.in.QuanLoc` | Càng trưởng thành bạn càng dồn tâm sức vào sự nghiệp; công việc là nơi bạn tìm thấy giá trị bản thân. |
| `than-tai` | `than.in.TaiBach` | Càng lớn tuổi bạn càng chú trọng chuyện tiền bạc, tài chính và sự bảo đảm vật chất. |
| `than-phuthe` | `than.in.PhuThe` | Bạn đầu tư nhiều tâm sức vào bạn đời/hôn nhân; hạnh phúc của bạn gắn chặt với chuyện tình cảm. |
| `than-thiendi` | `than.in.ThienDi` | Bạn năng động bên ngoài, hợp đi lại, giao tiếp, mở rộng quan hệ hơn là ở yên một chỗ. |
| `than-phucduc` | `than.in.PhucDuc` | Bạn coi trọng đời sống tinh thần, sự an yên trong lòng hơn là bon chen bề nổi. |

### 2.5 Cách cục / patterns (weight 65)

| id | when | text (VN) |
| --- | --- | --- |
| `pat-satphatham` | `pattern.SatPhaTham` | Cuộc đời bạn nhiều biến động, thăng trầm rõ rệt; bạn hợp với thay đổi, bứt phá hơn là an phận. |
| `pat-cndl` | `pattern.CoNguyetDongLuong` | Bạn hợp công việc ổn định, chuyên môn, hành chính hoặc chăm sóc/hỗ trợ người khác hơn là bon chen thương trường. |
| `pat-tuphu` | `pattern.TuPhu` | Bạn hướng tới ổn định, có tố chất quản lý, thích xây nền tảng vững chắc và lâu dài. |

### 2.6 Breadth palaces (weight 50 — pick for coverage)

| id | when | text (VN) |
| --- | --- | --- |
| `phuthe-cattinh` | Phu Thê nhiều cát tinh | Trong tình cảm, bạn coi trọng sự gắn bó lâu dài và có xu hướng gặp được người phù hợp. |
| `phuthe-satky` | Phu Thê có sát tinh/Kỵ | Đường tình duyên của bạn đôi lúc trắc trở, cần thời gian và va vấp mới ổn định. |
| `taibach-thu` | Tài Bạch có Phủ/Lộc | Bạn biết giữ tiền và tích lũy; tài chính nhìn chung vững hơn theo thời gian. |
| `taibach-dongtieu` | Tài Bạch có Phá/Không/Kiếp | Thu nhập của bạn dễ trồi sụt, kiếm được nhưng cũng tiêu/đầu tư mạnh tay. |
| `phucduc-annhien` | Phúc Đức nhiều cát tinh | Sâu bên trong bạn là người tương đối an nhiên, dễ bằng lòng và hồi phục nhanh sau khó khăn. |
| `phucduc-longhi` | Phúc Đức có Kỵ/sát tinh | Sâu bên trong bạn hay lo nghĩ, khó thảnh thơi trọn vẹn dù bên ngoài vẫn ổn. |

---

## 3. Selection algorithm

```
collectStatements(chart):
  features = extractFeatures(chart)              # §1, deterministic
  candidates = bank.filter(s => s.when matches features)
  # 1) always include the Mệnh chính tinh statement (highest weight)
  # 2) apply độ-sáng variant (sang vs ham) where the star has both
  # 3) rank by weight desc, then by a stable feature order
  # 4) enforce category diversity: at most 1 per category until each
  #    category is represented, then fill remaining slots by weight
  # 5) target 6 (min 5, max 8); never emit two statements with the
  #    same category+polarity that would feel redundant
  return top(candidates, 6)
```

Determinism: same chart ⇒ same statements in the same order (no
randomness). This makes the funnel testable and cache-friendly.

Edge cases:
- **Vô chính diệu Mệnh:** use `menh-vcd`, then lean on Thân, patterns, and
  the borrowed (opposite-palace) chính tinh for extra statements.
- **Sparse chart features:** fall back to breadth-palace statements (§2.6)
  to always reach ≥5.
- **Conflicting brightness variants:** pick the one matching the star's
  actual `dac` at Mệnh.

---

## 4. How answers calibrate the reading

Store per statement: `{ id, feature, category, answer }` where answer ∈
`{ dung, dung_mot_phan, khong_dung }`.

Fed into the reading prompt (see prompt-design.md) as three buckets:

- **Confirmed (`dung`):** treat these traits as strongly present — lead
  with and reinforce them.
- **Partly (`dung_mot_phan`):** present but nuanced — hedge and explore the
  conditional expression of that star.
- **Denied (`khong_dung`):** do **not** drop the star, but explain its
  *alternative* expression (e.g. a hãm/afflicted or sublimated form), and
  down-weight the confident personality claim. Denials are signal, not
  noise — they often mean the star manifests in a less obvious way.

This keeps the paid reading feeling *responsive* to what the user just
told us, which is the core of the trust mechanic.

---

## 5. Open items for domain review

- Validate each statement against classical interpretations; expand the
  bank to cover common phụ tinh combinations at Mệnh.
- Add độ-sáng variants for more chính tinh (only Thái Dương / Thái Âm are
  split here).
- Decide whether to include one **đại vận / current-luck** statement
  ("giai đoạn này bạn đang…") — higher engagement but needs năm-xem input.
- Tune weights and the target count (6) against real completion data.
