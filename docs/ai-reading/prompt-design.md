# Prompt Design — reading generation & Q&A (Fable 5)

Status: Draft for review · Date: 2026-07-22
Related: [ADR-0005](./adr/0005-model-fable5-prompt-caching.md),
[ADR-0006](./adr/0006-templated-verification-no-llm-prepay.md),
[FR-6](./FR.md), [FR-7](./FR.md), [verification-bank.md](./verification-bank.md)

All Claude calls are **server-side in the Worker**. Two call types share one
cached prefix: the one-time **reading** and the multi-turn **Q&A**.

Model: `claude-fable-5` (config-driven; can be swapped/upgraded per
ADR-0005). Output language: **Vietnamese**.

---

## 1. Message layout & caching boundary

The request is assembled so the expensive, stable part is cached and reused
across every Q&A turn:

```
system:            [PERSONA + RULES]                 ← cached (stable)
user (turn 0):     [CHART_JSON + VERIFICATION]       ← cached (stable)
assistant (turn 0):[THE GENERATED READING]           ← cached after 1st gen
--- cache boundary ---
user (turn n):     [QUESTION n]                      ← uncached, small
assistant (turn n):[ANSWER n]
```

- The **reading** call produces the `assistant (turn 0)` content; it is
  persisted (`reading_md`) and never regenerated (ADR-0008).
- Each **Q&A** call replays the cached prefix + prior short turns + the new
  question. Marginal cost ≈ cache-read + a few hundred tokens (ADR-0005).
- `cache_control` markers are placed on the system block and the turn-0
  user block (and the stored reading once it exists).

---

## 2. System prompt (persona + rules)

> Bạn là một chuyên gia luận giải Tử Vi Đẩu Số dày dặn, viết bằng tiếng
> Việt tự nhiên, ấm áp và dễ hiểu cho người không rành thuật ngữ. Bạn luận
> giải **chỉ dựa trên lá số được cung cấp**, không bịa thêm sao hay dữ kiện
> không có trong dữ liệu.
>
> Nguyên tắc:
> - Giải thích theo hướng **tính cách, xu hướng và lời khuyên**, không phán
>   như đúng-sai tuyệt đối hay tiên tri sự việc chắc chắn xảy ra.
> - Khi nhắc đến sao, nói ngắn gọn ý nghĩa để người đọc hiểu, tránh sa đà
>   thuật ngữ.
> - Tôn trọng thông tin người dùng đã xác nhận/không xác nhận về bản thân
>   (mục "Đối chiếu"): nhấn mạnh nét đã xác nhận, nói nhẹ hoặc diễn giải
>   cách biểu hiện khác với nét bị phủ nhận.
> - **Không** đưa ra chẩn đoán y tế, lời khuyên đầu tư/pháp lý mang tính
>   quyết định. Với các chủ đề nhạy cảm (sức khỏe, tiền bạc lớn, hôn nhân),
>   đưa góc nhìn tham khảo và khuyến khích cân nhắc thực tế.
> - Giọng văn tích cực, xây dựng; với nét bất lợi thì nêu cách hóa giải/ứng
>   xử thay vì gieo lo sợ.
> - Đây là nội dung **mang tính tham khảo, giải trí**.
>
> Luôn trả lời bằng tiếng Việt.

Guardrails are enforced in the prompt **and** by a lightweight server-side
output check (see §6).

---

## 3. Turn-0 user content (chart + verification)

Sent once, cached. Two parts:

**(a) Structured chart JSON** — a compact projection of the `lunar-core`
`TuViChart`, e.g.:

```json
{
  "sinh": { "duong": "12/4/1989", "gio": "Tuất", "gioiTinh": "nam" },
  "amLich": "7/3 Kỷ Tỵ",
  "menh": { "cung": "Mệnh", "chi": "Tuất", "canChi": "Canh Tuất" },
  "than": { "trong": "Quan Lộc" },
  "cuc": "Thổ ngũ cục",
  "banMenh": "Đại Lâm Mộc",
  "menhChu": "Vũ Khúc", "thanChu": "Thiên Cơ",
  "amDuong": "Âm Nam",
  "cungMenhSao": [
    { "ten": "Thiên Cơ", "chinh": true, "dac": "H", "hoa": null }
  ],
  "cacCung": [
    { "cung": "Mệnh", "chi": "Tuất", "sao": [ ... "ten/dac/hoa/nature" ... ] },
    ... 12 cung ...
  ],
  "tuan": ["Tuất","Hợi"], "triet": ["Thân","Dậu"],
  "daiVanHienTai": { "tuoi": "5-15", "cung": "..." }   // if năm-xem given
}
```

The server builds this from the recomputed chart (ADR-0008) — never from
client input.

**(b) Verification block** — the three buckets from the questionnaire:

```
Đối chiếu với người xem (họ tự nhận xét):
- ĐÚNG:        [statement text, ...]
- ĐÚNG MỘT PHẦN:[statement text, ...]
- KHÔNG ĐÚNG:  [statement text, ...]
```

---

## 4. Reading output contract (FR-6)

Ask for Markdown with these fixed sections, in order, in Vietnamese:

1. **Tổng quan** — 2–3 câu nắm bắt thần thái lá số.
2. **Tính cách & nội tâm** — bám sát cung Mệnh/Thân/Phúc Đức và phần Đối
   chiếu.
3. **Sự nghiệp & công danh** — cung Quan Lộc, tài năng, hướng nghề hợp.
4. **Tài lộc** — cung Tài Bạch, cách kiếm–giữ tiền.
5. **Tình duyên & hôn nhân** — cung Phu Thê.
6. **Sức khỏe** — cung Tật Ách, ở mức tham khảo, không chẩn đoán.
7. **Vận trình theo đại vận** — vài giai đoạn nổi bật (nếu có năm xem).
8. **Lời khuyên** — 3–5 gạch đầu dòng thiết thực.

Length guidance: ~700–1100 từ tổng cộng; mỗi mục vài câu, không lan man.
End with a one-line disclaimer. Section order and headings are fixed so the
UI can render/anchor them consistently.

---

## 5. Q&A prompt (FR-7)

- Reuses the cached prefix (system + chart + reading).
- New user turn = the raw question. A short instruction reminds the model
  to answer **grounded in this chart and the reading above**, concisely
  (aim < ~250 từ unless the user asks to go deep), and to stay in tử vi
  scope.
- If a question is out of scope (not about this chart), harmful, or asks for
  a definitive medical/financial/legal verdict, the model gives a brief,
  kind redirect back to what the chart can speak to (FR-7.6).
- Prior Q&A turns are included (bounded window) so follow-ups have context.

---

## 6. Safety & quality checks (server-side)

Beyond the prompt:
- **Output scope check:** a cheap heuristic/regex pass flags responses that
  drift into explicit medical dosage, guaranteed financial returns, or
  legal directives; on flag, the Worker appends the standard reference
  caveat (never silently blocks a paid reading).
- **Empty/short-output guard:** if generation returns too little, retry once
  (still one-shot from the user's perspective; not re-charged, ADR-0008).
- **Golden-chart regression:** a small fixed set of charts + expected
  section structure is checked when the prompt or model changes (NFR-MAINT4)
  — assert structure/sections/scope, not exact wording.

---

## 7. Configuration (not hard-coded)

| Key | Purpose | Default |
| --- | --- | --- |
| `READING_MODEL` | model for the one-time reading | `claude-fable-5` |
| `QA_MODEL` | model for Q&A turns | `claude-fable-5` |
| `READING_MAX_TOKENS` | output cap for a reading | ~2000 |
| `QA_MAX_TOKENS` | output cap per answer | ~700 |
| `QA_HISTORY_TURNS` | prior turns kept in context | ~8 |
| `TEMPERATURE` | sampling temperature | ~0.7 |

Changing model or amounts is a config change, not a code change (ADR-0005,
NFR-MAINT2). All values validated against current Fable 5 limits/pricing
before launch.

---

## 8. Open items for review

- Final Vietnamese wording of the persona and section prompts.
- Whether to **stream** the reading for better perceived latency (NFR-P4).
- Exact compact chart-JSON shape (keep it small to control cached-token
  size).
- Bounded Q&A history strategy (turn window vs summary) as threads grow.
