from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'user'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(200), nullable=False)
    username: Mapped[str] = mapped_column(
        String(80), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=True)
    subscription_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), default=True, nullable=False)

    # Relationships
    favorite_planets: Mapped[list["FavoritePlanet"]] = relationship(
        "FavoritePlanet", back_populates="user", cascade="all, delete-orphan")
    favorite_characters: Mapped[list["FavoriteCharacter"]] = relationship(
        "FavoriteCharacter", back_populates="user", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "subscription_date": self.subscription_date.isoformat() if self.subscription_date else None,
            "is_active": self.is_active
        }


class Planet(db.Model):
    __tablename__ = 'planet'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    climate: Mapped[str] = mapped_column(String(100), nullable=True)
    terrain: Mapped[str] = mapped_column(String(100), nullable=True)
    population: Mapped[str] = mapped_column(String(100), nullable=True)
    diameter: Mapped[str] = mapped_column(String(100), nullable=True)
    gravity: Mapped[str] = mapped_column(String(100), nullable=True)
    orbital_period: Mapped[str] = mapped_column(String(100), nullable=True)
    rotation_period: Mapped[str] = mapped_column(String(100), nullable=True)
    surface_water: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    native_characters: Mapped[list["Character"]] = relationship(
        "Character", back_populates="homeworld_planet")
    favorited_by: Mapped[list["FavoritePlanet"]] = relationship(
        "FavoritePlanet", back_populates="planet", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "climate": self.climate,
            "terrain": self.terrain,
            "population": self.population,
            "diameter": self.diameter,
            "gravity": self.gravity,
            "orbital_period": self.orbital_period,
            "rotation_period": self.rotation_period,
            "surface_water": self.surface_water,
            "description": self.description
        }


class Character(db.Model):
    __tablename__ = 'character'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    height: Mapped[str] = mapped_column(String(100), nullable=True)
    mass: Mapped[str] = mapped_column(String(100), nullable=True)
    hair_color: Mapped[str] = mapped_column(String(100), nullable=True)
    skin_color: Mapped[str] = mapped_column(String(100), nullable=True)
    eye_color: Mapped[str] = mapped_column(String(100), nullable=True)
    birth_year: Mapped[str] = mapped_column(String(100), nullable=True)
    gender: Mapped[str] = mapped_column(String(100), nullable=True)
    homeworld_id: Mapped[int] = mapped_column(
        ForeignKey('planet.id'), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    homeworld_planet: Mapped["Planet"] = relationship(
        "Planet", back_populates="native_characters")
    favorited_by: Mapped[list["FavoriteCharacter"]] = relationship(
        "FavoriteCharacter", back_populates="character", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "height": self.height,
            "mass": self.mass,
            "hair_color": self.hair_color,
            "skin_color": self.skin_color,
            "eye_color": self.eye_color,
            "birth_year": self.birth_year,
            "gender": self.gender,
            "homeworld_id": self.homeworld_id,
            "homeworld_name": self.homeworld_planet.name if self.homeworld_planet else None,
            "description": self.description
        }


class FavoritePlanet(db.Model):
    __tablename__ = 'favorite_planet'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    planet_id: Mapped[int] = mapped_column(
        ForeignKey('planet.id'), nullable=False)
    added_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship(
        "User", back_populates="favorite_planets")
    planet: Mapped["Planet"] = relationship(
        "Planet", back_populates="favorited_by")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "planet_id": self.planet_id,
            "planet_name": self.planet.name if self.planet else None,
            "added_date": self.added_date.isoformat() if self.added_date else None
        }


class FavoriteCharacter(db.Model):
    __tablename__ = 'favorite_character'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    character_id: Mapped[int] = mapped_column(
        ForeignKey('character.id'), nullable=False)
    added_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    user: Mapped["User"] = relationship(
        "User", back_populates="favorite_characters")
    character: Mapped["Character"] = relationship(
        "Character", back_populates="favorited_by")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "character_id": self.character_id,
            "character_name": self.character.name if self.character else None,
            "added_date": self.added_date.isoformat() if self.added_date else None
        }