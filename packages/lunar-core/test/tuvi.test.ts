import { describe, expect, it } from 'vitest';
import { laSoTuVi, starBrightness, tuViPosition, CHI } from '../src';

describe('tuViPosition (an sao Tử Vi theo cục)', () => {
  it('matches the classical table for Thủy nhị cục', () => {
    // ngày 1 → Sửu, 2 → Dần, 3 → Dần, 4 → Mão
    expect(tuViPosition(2, 1)).toBe(1);
    expect(tuViPosition(2, 2)).toBe(2);
    expect(tuViPosition(2, 3)).toBe(2);
    expect(tuViPosition(2, 4)).toBe(3);
  });

  it('matches the classical table for Hỏa lục cục', () => {
    // ngày 1 → Dậu, 6 → Dần, 7 → Tuất
    expect(tuViPosition(6, 1)).toBe(9);
    expect(tuViPosition(6, 6)).toBe(2);
    expect(tuViPosition(6, 7)).toBe(10);
  });
});

describe('laSoTuVi', () => {
  // 1984-02-02 = 1/1 Giáp Tý; giờ Tý; nam
  const chart = laSoTuVi(2, 2, 1984, 0, 'nam');

  it('an Mệnh/Thân: tháng 1 giờ Tý → both at Dần', () => {
    expect(chart.lunar).toMatchObject({ day: 1, month: 1, year: 1984 });
    expect(chart.menhIndex).toBe(2);
    expect(chart.thanIndex).toBe(2);
    expect(chart.palaces[2].cung).toBe('Mệnh');
    expect(chart.palaces[2].than).toBe(true);
  });

  it('cục: năm Giáp, Mệnh tại Dần → Bính Dần → Hỏa lục cục', () => {
    expect(chart.palaces[2].canChi).toBe('Bính Dần');
    expect(chart.cuc).toMatchObject({ name: 'Hỏa lục cục', so: 6, element: 'Hỏa' });
  });

  it('năm Giáp Tý: bản mệnh Hải Trung Kim, Dương Nam', () => {
    expect(chart.yearCanChi).toBe('Giáp Tý');
    expect(chart.banMenh).toBe('Hải Trung Kim');
    expect(chart.amDuong).toBe('Dương Nam');
  });

  it('places all 14 chính tinh exactly once', () => {
    const majors = chart.palaces.flatMap((p) => p.stars.filter((s) => s.kind === 'chinh'));
    expect(majors).toHaveLength(14);
    expect(new Set(majors.map((s) => s.name)).size).toBe(14);
  });

  it('Thiên Phủ mirrors Tử Vi across the Dần–Thân axis', () => {
    const find = (name: string) =>
      chart.palaces.findIndex((p) => p.stars.some((s) => s.name === name));
    expect((find('Tử Vi') + find('Thiên Phủ')) % 12).toBe(4);
  });

  it('giờ Tý: Địa Không and Địa Kiếp cùng cung Hợi; Lộc Tồn năm Giáp tại Dần', () => {
    const hoi = chart.palaces[11].stars.map((s) => s.name);
    expect(hoi).toContain('Địa Không');
    expect(hoi).toContain('Địa Kiếp');
    expect(chart.palaces[2].stars.map((s) => s.name)).toContain('Lộc Tồn');
  });

  it('tứ hóa năm Giáp: Liêm Trinh hóa Lộc … Thái Dương hóa Kỵ', () => {
    const withHoa = new Map<string, string>();
    for (const p of chart.palaces)
      for (const s of p.stars) if (s.hoa) withHoa.set(s.name, s.hoa);
    expect(withHoa.get('Liêm Trinh')).toBe('Hóa Lộc');
    expect(withHoa.get('Phá Quân')).toBe('Hóa Quyền');
    expect(withHoa.get('Vũ Khúc')).toBe('Hóa Khoa');
    expect(withHoa.get('Thái Dương')).toBe('Hóa Kỵ');
  });

  it('đại vận: Dương Nam khởi thuận từ Mệnh với tuổi = cục số', () => {
    expect(chart.palaces[2].daiVan).toBe(6); // Mệnh
    expect(chart.palaces[3].daiVan).toBe(16); // thuận chiều
    expect(chart.palaces[1].daiVan).toBe(116);
  });

  it('12 cung names all present, đủ 12 sao vòng Tràng Sinh', () => {
    expect(new Set(chart.palaces.map((p) => p.cung)).size).toBe(12);
    expect(new Set(chart.palaces.map((p) => p.trangSinh)).size).toBe(12);
  });

  it('gender/năm âm flips direction (Âm Nữ thuận)', () => {
    // 1985 Ất Sửu (âm), nữ → thuận
    const c2 = laSoTuVi(21, 2, 1985, 3, 'nu'); // 2/2 Ất Sửu, giờ Mão
    expect(c2.amDuong).toBe('Âm Nữ');
    const menh = c2.menhIndex;
    expect(c2.palaces[(menh + 1) % 12].daiVan - c2.palaces[menh].daiVan).toBe(10);
  });

  it('hour chi is echoed and CHI labels align', () => {
    expect(chart.hourName).toBe('Giờ Tý');
    expect(CHI[chart.menhIndex]).toBe('Dần');
  });

  const at = (name: string) =>
    chart.palaces.findIndex((p) => p.stars.some((s) => s.name === name));

  it('vòng Thái Tuế khởi tại chi năm (Tý), đủ 12 sao thuận', () => {
    expect(at('Thái Tuế')).toBe(0);
    expect(at('Tang Môn')).toBe(2);
    expect(at('Tuế Phá')).toBe(6);
    expect(at('Bạch Hổ')).toBe(8);
  });

  it('vòng Bác Sĩ khởi tại Lộc Tồn, thuận với Dương Nam', () => {
    expect(at('Bác Sĩ')).toBe(at('Lộc Tồn'));
    expect(at('Lực Sĩ')).toBe((at('Lộc Tồn') + 1) % 12);
    expect(at('Quan Phủ')).toBe((at('Lộc Tồn') + 11) % 12);
  });

  it('Thiên Thương tại Nô Bộc, Thiên Sứ tại Tật Ách', () => {
    expect(chart.palaces[at('Thiên Thương')].cung).toBe('Nô Bộc');
    expect(chart.palaces[at('Thiên Sứ')].cung).toBe('Tật Ách');
  });

  it('sao theo chi năm Tý: Long Trì Thìn, Phượng Các Tuất, Hoa Cái Thìn, Đào Hoa Dậu', () => {
    expect(at('Long Trì')).toBe(4);
    expect(at('Phượng Các')).toBe(10);
    expect(at('Giải Thần')).toBe(at('Phượng Các'));
    expect(at('Hoa Cái')).toBe(4);
    expect(at('Đào Hoa')).toBe(9);
  });

  it('Tam Thai/Bát Tọa ngày 1 trùng Tả Phù/Hữu Bật', () => {
    expect(at('Tam Thai')).toBe(at('Tả Phù'));
    expect(at('Bát Tọa')).toBe(at('Hữu Bật'));
  });

  it('places the full star set (93 stars, the classical count)', () => {
    const total = chart.palaces.reduce((n, p) => n + p.stars.length, 0);
    expect(total).toBe(93);
    const names = chart.palaces.flatMap((p) => p.stars.map((s) => s.name));
    expect(new Set(names).size).toBe(93); // no duplicates
  });

  it('Tuần/Triệt năm Giáp Tý: Tuần tại Tuất-Hợi, Triệt tại Thân-Dậu', () => {
    expect(chart.tuan).toEqual([10, 11]);
    expect(chart.triet).toEqual([8, 9]);
  });

  it('Tuần/Triệt năm Ất Sửu: cùng tuần giáp → Tuất-Hợi; Triệt Ngọ-Mùi', () => {
    const c2 = laSoTuVi(21, 2, 1985, 3, 'nu');
    expect(c2.tuan).toEqual([10, 11]);
    expect(c2.triet).toEqual([6, 7]);
  });

  it('Thiên La tại Thìn, Địa Võng tại Tuất, LN Văn Tinh năm Giáp tại Tỵ', () => {
    expect(chart.palaces[4].stars.map((s) => s.name)).toContain('Thiên La');
    expect(chart.palaces[10].stars.map((s) => s.name)).toContain('Địa Võng');
    expect(chart.palaces[5].stars.map((s) => s.name)).toContain('LN Văn Tinh');
  });

  it('matches the tuvi.vn reference chart (12/4/1989 19:30, nam)', () => {
    // Reference lá số: sinh 12/4/1989 giờ Tuất — âm lịch 7/3 Kỷ Tỵ,
    // ngày Nhâm Dần, giờ Canh Tuất, Đại Lâm Mộc, Thổ ngũ cục.
    const c = laSoTuVi(12, 4, 1989, 10, 'nam');
    expect(c.lunar).toMatchObject({ day: 7, month: 3, year: 1989 });
    expect(c.yearCanChi).toBe('Kỷ Tỵ');
    expect(c.dayCanChi).toBe('Nhâm Dần');
    expect(c.hourCanChi).toBe('Canh Tuất');
    expect(c.amDuong).toBe('Âm Nam');
    expect(c.banMenh).toBe('Đại Lâm Mộc');
    expect(c.cuc.name).toBe('Thổ ngũ cục');
    expect(c.cucRelation).toBe('Mệnh Mộc khắc Cục Thổ');
    expect(c.menhChu).toBe('Vũ Khúc');
    expect(c.thanChu).toBe('Thiên Cơ');
    // Đại vận per the reference: Mệnh 5, then nghịch 15, 25…
    expect(c.palaces[c.menhIndex].daiVan).toBe(5);
    expect(c.palaces[(c.menhIndex + 11) % 12].daiVan).toBe(15);
  });

  it('lưu niên stars for năm xem 2026 (Bính Ngọ) match the reference chart', () => {
    const c = laSoTuVi(12, 4, 1989, 10, 'nam', 2026);
    expect(c.namXem).toMatchObject({ year: 2026, canChi: 'Bính Ngọ', tuoi: 38 });
    const at = (name: string) =>
      c.palaces.findIndex((p) => p.stars.some((s) => s.kind === 'luu' && s.name === name));
    expect(at('L.Thái Tuế')).toBe(6); // Ngọ
    expect(at('L.Lộc Tồn')).toBe(5); // Bính → Tỵ
    expect(at('L.Kình Dương')).toBe(6);
    expect(at('L.Văn Xương')).toBe(8); // Bính → Thân
    expect(at('L.Văn Khúc')).toBe(6); // Bính → Ngọ
    expect(at('L.Thiên Khôi')).toBe(11); // Bính → Hợi
    expect(at('L.Thiên Việt')).toBe(9); // Bính → Dậu
    expect(at('L.Tang Môn')).toBe(8);
    expect(at('L.Bạch Hổ')).toBe(2);
    expect(at('L.Thiên Khốc')).toBe(0);
    expect(at('L.Thiên Hư')).toBe(0);
    expect(at('L.Hồng Loan')).toBe(9);
    expect(at('L.Đào Hoa')).toBe(3);
    expect(at('L.Thiên Mã')).toBe(8);
    expect(at('L.Kiếp Sát')).toBe(11);
    // Lưu tứ hóa của Bính đặt tại cung của sao được hóa
    expect(at('L.Hóa Lộc')).toBe(7); // Thiên Đồng tại Mùi
    expect(at('L.Hóa Quyền')).toBe(11); // Thiên Cơ tại Hợi
    expect(at('L.Hóa Khoa')).toBe(0); // Văn Xương tại Tý
    expect(at('L.Hóa Kỵ')).toBe(4); // Liêm Trinh tại Thìn
    const luuCount = c.palaces.reduce(
      (n, p) => n + p.stars.filter((s) => s.kind === 'luu').length,
      0,
    );
    expect(luuCount).toBe(20);
  });

  it('omitting năm xem places no lưu stars', () => {
    const total = chart.palaces.reduce(
      (n, p) => n + p.stars.filter((s) => s.kind === 'luu').length,
      0,
    );
    expect(total).toBe(0);
    expect(chart.namXem).toBeUndefined();
  });

  it('every star carries ngũ hành and cát/hung nature', () => {
    for (const p of chart.palaces) {
      for (const st of p.stars) {
        expect(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']).toContain(st.element);
        expect(['cat', 'hung']).toContain(st.nature);
      }
    }
    const find = (name: string) =>
      chart.palaces.flatMap((p) => p.stars).find((s) => s.name === name)!;
    expect(find('Vũ Khúc')).toMatchObject({ element: 'Kim', nature: 'cat' });
    expect(find('Kình Dương')).toMatchObject({ element: 'Kim', nature: 'hung' });
    expect(find('Địa Kiếp')).toMatchObject({ element: 'Hỏa', nature: 'hung' });
    expect(find('Tả Phù')).toMatchObject({ element: 'Thổ', nature: 'cat' });
    expect(find('Thiên Riêu')).toMatchObject({ element: 'Thủy', nature: 'hung' });
    expect(find('Thiên Không')).toMatchObject({ element: 'Hỏa', nature: 'hung' });
    expect(find('Hữu Bật')).toMatchObject({ element: 'Thủy', nature: 'cat' });
    expect(find('Thiên Phúc')).toMatchObject({ element: 'Thổ', nature: 'cat' });
    expect(find('Lực Sĩ')).toMatchObject({ element: 'Hỏa', nature: 'cat' });
    expect(find('Thiên Đức')).toMatchObject({ element: 'Hỏa', nature: 'cat' });
  });
});

describe('độ sáng (miếu / vượng / đắc / bình / hãm)', () => {
  const T = { ty: 0, suu: 1, dan: 2, mao: 3, thin: 4, ti: 5, ngo: 6, mui: 7, than: 8, dau: 9, tuat: 10, hoi: 11 };

  it('follows the classical table for the sun and moon', () => {
    expect(starBrightness('Thái Dương', T.ngo)).toBe('M'); // sun at noon
    expect(starBrightness('Thái Dương', T.ty)).toBe('H'); // sun at midnight
    expect(starBrightness('Thái Âm', T.dau)).toBe('M');
    expect(starBrightness('Thái Âm', T.hoi)).toBe('M');
    expect(starBrightness('Thái Âm', T.ngo)).toBe('H');
  });

  it('Thiên Phủ is rated everywhere and never hãm', () => {
    for (let chi = 0; chi < 12; chi++) {
      const b = starBrightness('Thiên Phủ', chi);
      expect(b).toBeDefined();
      expect(b).not.toBe('H');
    }
    expect(starBrightness('Thiên Phủ', T.dan)).toBe('M');
    expect(starBrightness('Thiên Phủ', T.thin)).toBe('V');
    expect(starBrightness('Thiên Phủ', T.ti)).toBe('Đ');
    expect(starBrightness('Thiên Phủ', T.mao)).toBe('B');
  });

  it('Văn Xương/Văn Khúc: đắc in the six âm cung, hãm in the six dương cung', () => {
    for (let chi = 0; chi < 12; chi++) {
      expect(starBrightness('Văn Xương', chi)).toBe(chi % 2 === 1 ? 'Đ' : 'H');
      expect(starBrightness('Văn Khúc', chi)).toBe(chi % 2 === 1 ? 'Đ' : 'H');
    }
  });

  it('bàng tinh with partial ratings: đắc only at their classical positions', () => {
    // Hóa Kỵ đắc at the four mộ cung
    for (let chi = 0; chi < 12; chi++) {
      expect(starBrightness('Hóa Kỵ', chi)).toBe([1, 4, 7, 10].includes(chi) ? 'Đ' : undefined);
    }
    expect(starBrightness('Thiên Hình', T.dan)).toBe('Đ');
    expect(starBrightness('Thiên Hình', T.ty)).toBeUndefined();
    expect(starBrightness('Thiên Mã', T.dan)).toBe('Đ');
    expect(starBrightness('Thiên Mã', T.than)).toBeUndefined();
    // Unrated stars have no brightness anywhere
    expect(starBrightness('Tả Phù', T.dan)).toBeUndefined();
    expect(starBrightness('Lộc Tồn', T.dan)).toBeUndefined();
  });

  it('placed stars carry dac matching their palace', () => {
    const c = laSoTuVi(12, 4, 1989, 10, 'nam');
    for (const p of c.palaces) {
      for (const st of p.stars) {
        if (st.kind === 'luu') {
          expect(st.dac).toBeUndefined();
        } else {
          expect(st.dac).toBe(starBrightness(st.name, p.chiIndex));
        }
      }
    }
    // Every chính tinh must be rated at its palace
    for (const p of c.palaces) {
      for (const st of p.stars.filter((s) => s.kind === 'chinh')) {
        expect(st.dac, `${st.name} @ ${CHI[p.chiIndex]}`).toBeDefined();
      }
    }
  });
});
